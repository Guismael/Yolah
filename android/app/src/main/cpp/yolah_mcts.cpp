#include <jni.h>

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <limits>
#include <random>
#include <sstream>
#include <string>
#include <vector>

namespace {

constexpr int BLACK_PLAYER = 0;
constexpr int WHITE_PLAYER = 1;

constexpr uint64_t FILE_A = 0x0101010101010101ULL;
constexpr uint64_t FILE_H = FILE_A << 7;

inline uint64_t bit_not(uint64_t n) {
    return ~n;
}

enum class Direction : int {
    NORTH = 8,
    EAST = 1,
    SOUTH = -8,
    WEST = -1,
    NORTH_EAST = 9,
    SOUTH_EAST = -7,
    SOUTH_WEST = -9,
    NORTH_WEST = 7,
};

inline uint64_t shift(Direction dir, uint64_t b) {
    switch (dir) {
        case Direction::NORTH:
            return b << 8;
        case Direction::EAST:
            return (b & bit_not(FILE_H)) << 1;
        case Direction::SOUTH:
            return b >> 8;
        case Direction::WEST:
            return (b & bit_not(FILE_A)) >> 1;
        case Direction::NORTH_EAST:
            return (b & bit_not(FILE_H)) << 9;
        case Direction::SOUTH_EAST:
            return (b & bit_not(FILE_H)) >> 7;
        case Direction::SOUTH_WEST:
            return (b & bit_not(FILE_A)) >> 9;
        case Direction::NORTH_WEST:
            return (b & bit_not(FILE_A)) << 7;
    }
    return 0;
}

const std::array<Direction, 8> kAllDirections = {
    Direction::NORTH,
    Direction::EAST,
    Direction::SOUTH,
    Direction::WEST,
    Direction::NORTH_EAST,
    Direction::SOUTH_EAST,
    Direction::SOUTH_WEST,
    Direction::NORTH_WEST,
};

struct Move {
    int from = 0;
    int to = 0;

    static Move none() {
        return {0, 0};
    }

    bool is_none() const {
        return from == 0 && to == 0;
    }

    std::string to_str() const {
        auto sq_to_str = [](int sq) {
            char file = static_cast<char>('a' + (sq % 8));
            char rank = static_cast<char>('1' + (sq / 8));
            std::string s;
            s.push_back(file);
            s.push_back(rank);
            return s;
        };
        return sq_to_str(from) + ":" + sq_to_str(to);
    }
};

struct Yolah {
    uint64_t black = 0;
    uint64_t white = 0;
    uint64_t empty = 0;
    int black_score = 0;
    int white_score = 0;
    int ply = 0;

    int current_player() const {
        return (ply & 1) ? WHITE_PLAYER : BLACK_PLAYER;
    }

    std::vector<Move> moves_for(int player) const {
        std::vector<Move> res;
        uint64_t free = bit_not(black | white | empty);
        uint64_t pieces = (player == BLACK_PLAYER) ? black : white;

        while (pieces) {
            uint64_t pos = pieces & -pieces;
            int from_sq = static_cast<int>(__builtin_ctzll(pos));
            for (Direction dir : kAllDirections) {
                uint64_t dst = shift(dir, pos);
                while (dst & free) {
                    int to_sq = static_cast<int>(__builtin_ctzll(dst));
                    res.push_back({from_sq, to_sq});
                    dst = shift(dir, dst);
                }
            }
            pieces &= ~pos;
        }

        if (res.empty()) {
            res.push_back(Move::none());
        }
        return res;
    }

    std::vector<Move> moves() const {
        return moves_for(current_player());
    }

    bool game_over() const {
        uint64_t possible = bit_not(black) & bit_not(white) & bit_not(empty);
        return (shift(Direction::NORTH, black) & possible) == 0 &&
               (shift(Direction::EAST, black) & possible) == 0 &&
               (shift(Direction::SOUTH, black) & possible) == 0 &&
               (shift(Direction::WEST, black) & possible) == 0 &&
               (shift(Direction::NORTH_EAST, black) & possible) == 0 &&
               (shift(Direction::SOUTH_EAST, black) & possible) == 0 &&
               (shift(Direction::SOUTH_WEST, black) & possible) == 0 &&
               (shift(Direction::NORTH_WEST, black) & possible) == 0 &&
               (shift(Direction::NORTH, white) & possible) == 0 &&
               (shift(Direction::EAST, white) & possible) == 0 &&
               (shift(Direction::SOUTH, white) & possible) == 0 &&
               (shift(Direction::WEST, white) & possible) == 0 &&
               (shift(Direction::NORTH_EAST, white) & possible) == 0 &&
               (shift(Direction::SOUTH_EAST, white) & possible) == 0 &&
               (shift(Direction::SOUTH_WEST, white) & possible) == 0 &&
               (shift(Direction::NORTH_WEST, white) & possible) == 0;
    }

    void play(const Move& m) {
        if (m.is_none()) {
            ply += 1;
            return;
        }

        uint64_t from_bb = 1ULL << m.from;
        uint64_t to_bb = 1ULL << m.to;

        if (current_player() == BLACK_PLAYER) {
            black = (black & ~from_bb) | to_bb;
            black_score += 1;
        } else {
            white = (white & ~from_bb) | to_bb;
            white_score += 1;
        }
        empty |= from_bb;
        ply += 1;
    }

    int result() const {
        if (!game_over()) {
            return 0;
        }
        if (black_score > white_score) {
            return 1;
        }
        if (white_score > black_score) {
            return -1;
        }
        return 0;
    }
};

struct MCTSNode {
    Yolah state;
    int parent = -1;
    Move move;
    std::vector<int> children;
    int visit_count = 0;
    double value_sum = 0.0;

    double value() const {
        return (visit_count > 0) ? (value_sum / visit_count) : 0.0;
    }
};

struct MCTSStats {
    int iterations = 0;
    double elapsed_s = 0.0;
    double playouts_per_s = 0.0;
};

double uct(const MCTSNode& parent, const MCTSNode& child, double c = 1.4) {
    double exploration = c * std::sqrt(std::log(parent.visit_count + 1.0) / (child.visit_count + 1e-9));
    return -child.value() + exploration;
}

int select_leaf(std::vector<MCTSNode>& nodes, int node_idx) {
    while (!nodes[node_idx].children.empty()) {
        int best_child = nodes[node_idx].children[0];
        double best_score = -std::numeric_limits<double>::infinity();
        for (int child_idx : nodes[node_idx].children) {
            double score = uct(nodes[node_idx], nodes[child_idx]);
            if (score > best_score) {
                best_score = score;
                best_child = child_idx;
            }
        }
        node_idx = best_child;
    }
    return node_idx;
}

int expand(std::vector<MCTSNode>& nodes, int node_idx, std::mt19937_64& rng) {
    if (nodes[node_idx].state.game_over()) {
        return node_idx;
    }

    auto moves = nodes[node_idx].state.moves();
    for (const Move& m : moves) {
        Yolah s2 = nodes[node_idx].state;
        s2.play(m);
        MCTSNode child;
        child.state = s2;
        child.parent = node_idx;
        child.move = m;
        nodes.push_back(std::move(child));
        nodes[node_idx].children.push_back(static_cast<int>(nodes.size() - 1));
    }

    std::uniform_int_distribution<size_t> dist(0, nodes[node_idx].children.size() - 1);
    return nodes[node_idx].children[dist(rng)];
}

int rollout(Yolah state, std::mt19937_64& rng) {
    while (!state.game_over()) {
        auto moves = state.moves();
        std::uniform_int_distribution<size_t> dist(0, moves.size() - 1);
        state.play(moves[dist(rng)]);
    }
    return state.result();
}

void backpropagate(std::vector<MCTSNode>& nodes, int node_idx, int reward) {
    while (node_idx >= 0) {
        nodes[node_idx].visit_count += 1;
        nodes[node_idx].value_sum += static_cast<double>(reward);
        reward = -reward;
        node_idx = nodes[node_idx].parent;
    }
}

Move mcts_best_move(const Yolah& root_state, int iterations, double time_limit_s, MCTSStats* out_stats = nullptr) {
    std::random_device rd;
    std::mt19937_64 rng(rd());

    std::vector<MCTSNode> nodes;
    nodes.reserve(120000);
    nodes.push_back(MCTSNode{root_state, -1, Move::none(), {}, 0, 0.0});

    const auto start = std::chrono::steady_clock::now();
    int it = 0;

        while (true) {
      double elapsed = std::chrono::duration<double>(std::chrono::steady_clock::now() - start).count();
      if (time_limit_s > 0.0 && elapsed >= time_limit_s) {
        break;
      }
      if (time_limit_s <= 0.0 && it >= iterations) {
        break;
      }

      int leaf_idx = select_leaf(nodes, 0);
      int expanded_idx = expand(nodes, leaf_idx, rng);
      int result = rollout(nodes[expanded_idx].state, rng);
      int reward = (nodes[expanded_idx].state.current_player() == BLACK_PLAYER) ? result : -result;
      backpropagate(nodes, expanded_idx, reward);
      it += 1;
    }

        const double elapsed = std::chrono::duration<double>(std::chrono::steady_clock::now() - start).count();
        const double nps = elapsed > 0.0 ? (static_cast<double>(it) / elapsed) : 0.0;
        if (out_stats != nullptr) {
                out_stats->iterations = it;
                out_stats->elapsed_s = elapsed;
                out_stats->playouts_per_s = nps;
        }

    if (nodes[0].children.empty()) {
      return Move::none();
    }

    std::vector<int> ranked = nodes[0].children;
    std::sort(ranked.begin(), ranked.end(), [&](int a, int b) {
      return nodes[a].visit_count > nodes[b].visit_count;
    });

    return nodes[ranked[0]].move;
}

uint64_t parse_u64_or_zero(const std::string& s) {
    try {
        return static_cast<uint64_t>(std::stoull(s));
    } catch (...) {
        return 0;
    }
}

}  // namespace

extern "C" JNIEXPORT jstring JNICALL
Java_com_yolah_yolah_mcts_YolahMctsModule_nativeGetBestMove(
    JNIEnv* env,
    jobject /*thiz*/,
    jstring j_black,
    jstring j_white,
    jstring j_empty,
    jint j_black_score,
    jint j_white_score,
    jint j_ply,
    jint j_iterations,
    jdouble j_time_limit_seconds) {

    const char* black_c = env->GetStringUTFChars(j_black, nullptr);
    const char* white_c = env->GetStringUTFChars(j_white, nullptr);
    const char* empty_c = env->GetStringUTFChars(j_empty, nullptr);

    std::string black_s = black_c ? black_c : "0";
    std::string white_s = white_c ? white_c : "0";
    std::string empty_s = empty_c ? empty_c : "0";

    env->ReleaseStringUTFChars(j_black, black_c);
    env->ReleaseStringUTFChars(j_white, white_c);
    env->ReleaseStringUTFChars(j_empty, empty_c);

    Yolah state;
    state.black = parse_u64_or_zero(black_s);
    state.white = parse_u64_or_zero(white_s);
    state.empty = parse_u64_or_zero(empty_s);
    state.black_score = static_cast<int>(j_black_score);
    state.white_score = static_cast<int>(j_white_score);
    state.ply = static_cast<int>(j_ply);

    int iterations = static_cast<int>(j_iterations);
    double time_limit_s = static_cast<double>(j_time_limit_seconds);

    MCTSStats stats;
    Move best = mcts_best_move(state, iterations, time_limit_s, &stats);
    std::ostringstream out;
    out << "{\"move\":\"" << best.to_str()
        << "\",\"iterations\":" << stats.iterations
        << ",\"elapsedSeconds\":" << std::fixed << std::setprecision(3) << stats.elapsed_s
        << ",\"playoutsPerSecond\":" << std::setprecision(0) << stats.playouts_per_s
        << "}";
    return env->NewStringUTF(out.str().c_str());
}

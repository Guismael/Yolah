#include <jni.h>

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <limits>
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

uint64_t parse_u64_or_zero(const std::string& s) {
    try {
        return static_cast<uint64_t>(std::stoull(s));
    } catch (...) {
        return 0;
    }
}

int popcount_u64(uint64_t x) {
    return static_cast<int>(__builtin_popcountll(x));
}

int count_on_squares(uint64_t bitboard, const std::vector<int>& squares) {
    int count = 0;

    for (int sq : squares) {
        if (bitboard & (1ULL << sq)) {
            count += 1;
        }
    }

    return count;
}

int mobility(const Yolah& state, int player) {
    auto moves = state.moves_for(player);

    if (moves.size() == 1 && moves[0].is_none()) {
        return 0;
    }

    return static_cast<int>(moves.size());
}

double evaluate_state(const Yolah& state, int player) {
    int opponent = (player == BLACK_PLAYER) ? WHITE_PLAYER : BLACK_PLAYER;

    int my_score = (player == BLACK_PLAYER) ? state.black_score : state.white_score;
    int opp_score = (player == BLACK_PLAYER) ? state.white_score : state.black_score;

    uint64_t my_bb = (player == BLACK_PLAYER) ? state.black : state.white;
    uint64_t opp_bb = (player == BLACK_PLAYER) ? state.white : state.black;

    int my_mobility = mobility(state, player);
    int opp_mobility = mobility(state, opponent);

    int my_piece_count = popcount_u64(my_bb);
    int opp_piece_count = popcount_u64(opp_bb);

    const std::vector<int> center_squares = {27, 28, 35, 36};

    int my_center = count_on_squares(my_bb, center_squares);
    int opp_center = count_on_squares(opp_bb, center_squares);

    int score_diff = my_score - opp_score;
    int mobility_diff = my_mobility - opp_mobility;
    int piece_diff = my_piece_count - opp_piece_count;
    int center_diff = my_center - opp_center;

    return 10.0 * score_diff
         + 2.0 * mobility_diff
         + 1.0 * piece_diff
         + 3.0 * center_diff;
}

double minimax_alpha_beta(
    Yolah state,
    int depth,
    double alpha,
    double beta,
    bool maximizing,
    int root_player
) {
    if (depth == 0 || state.game_over()) {
        return evaluate_state(state, root_player);
    }

    auto moves = state.moves();

    if (maximizing) {
        double best_value = -std::numeric_limits<double>::infinity();

        for (const Move& move : moves) {
            Yolah child = state;
            child.play(move);

            double value = minimax_alpha_beta(
                child,
                depth - 1,
                alpha,
                beta,
                false,
                root_player
            );

            best_value = std::max(best_value, value);
            alpha = std::max(alpha, best_value);

            if (beta <= alpha) {
                break;
            }
        }

        return best_value;
    }

    double best_value = std::numeric_limits<double>::infinity();

    for (const Move& move : moves) {
        Yolah child = state;
        child.play(move);

        double value = minimax_alpha_beta(
            child,
            depth - 1,
            alpha,
            beta,
            true,
            root_player
        );

        best_value = std::min(best_value, value);
        beta = std::min(beta, best_value);

        if (beta <= alpha) {
            break;
        }
    }

    return best_value;
}

Move minimax_best_move(const Yolah& state, int depth) {
    auto moves = state.moves();

    if (moves.empty()) {
        return Move::none();
    }

    int root_player = state.current_player();

    Move best_move = moves[0];
    double best_value = -std::numeric_limits<double>::infinity();

    for (const Move& move : moves) {
        Yolah child = state;
        child.play(move);

        double value = minimax_alpha_beta(
            child,
            depth - 1,
            -std::numeric_limits<double>::infinity(),
            std::numeric_limits<double>::infinity(),
            false,
            root_player
        );

        if (value > best_value) {
            best_value = value;
            best_move = move;
        }
    }

    return best_move;
}

} // namespace

extern "C" JNIEXPORT jstring JNICALL
Java_com_yolah_yolah_minimax_YolahMinimaxModule_nativeGetBestMoveMinimax(
    JNIEnv* env,
    jobject,
    jstring j_black,
    jstring j_white,
    jstring j_empty,
    jint j_black_score,
    jint j_white_score,
    jint j_ply,
    jint j_depth
) {
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

    int depth = static_cast<int>(j_depth);
    if (depth < 1) {
        depth = 1;
    }

    Move best = minimax_best_move(state, depth);

    std::ostringstream out;
    out << "{\"move\":\"" << best.to_str()
        << "\",\"depth\":" << depth
        << "}";

    return env->NewStringUTF(out.str().c_str());
}

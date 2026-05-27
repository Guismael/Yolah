cmake_minimum_required(VERSION 3.13)
project(yolah_mcts)

add_library(yolah_mcts SHARED
    yolah_mcts.cpp
    yolah_minimax.cpp
)

find_library(log-lib log)

target_link_libraries(yolah_mcts ${log-lib})

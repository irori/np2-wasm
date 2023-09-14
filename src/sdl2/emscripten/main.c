/**
 * @file	main.c
 * @brief	メイン
 */

#include <stdio.h>
#include "compiler.h"
#include "../np2.h"

/**
 * メイン
 * @param[in] argc 引数
 * @param[in] argv 引数
 * @return リザルト コード
 */
int main(int argc, char * argv[])
{
	return np2_main(argc, argv);
}

void msgbox(const char *title, const char *msg) {
	fprintf(stderr, "%s: %s\n", title, msg);
}

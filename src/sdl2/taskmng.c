#include	"compiler.h"
#include	"inputmng.h"
#include	"mousemng.h"
#include	"taskmng.h"
#include	"sdlkbd.h"
#include "sysmenu.h"
#include "np2.h"
#include "embed/menubase/menubase.h"


	BOOL	task_avail;


void sighandler(int signo) {

	(void)signo;
	task_avail = FALSE;
}


void taskmng_initialize(void) {

	task_avail = TRUE;
}

void taskmng_exit(void) {

#ifdef __EMSCRIPTEN__
	EM_ASM(Module.onExit());
#else
	task_avail = FALSE;
#endif
}

void taskmng_rol(void) {

	SDL_Event	e;

	if (!task_avail) {
		return;
	}
	while (SDL_PollEvent(&e)) {
		switch(e.type) {
		case SDL_MOUSEMOTION:
			if (menuvram == NULL) {
				mousemng_onmove(&e.motion);
			}
			else {
				menubase_moving(e.motion.x, e.motion.y, 0);
			}
			break;

		case SDL_MOUSEBUTTONUP:
			switch(e.button.button) {
				case SDL_BUTTON_LEFT:
					if (menuvram != NULL)
					{
						menubase_moving(e.button.x, e.button.y, 2);
					}
#if defined(__IPHONEOS__)
					else if (SDL_IsTextInputActive())
					{
						SDL_StopTextInput();
					}
					else if (e.button.y >= 320)
					{
						SDL_StartTextInput();
					}
#endif
					else
					{
						mousemng_buttonevent(&e.button);
					}
					break;

				case SDL_BUTTON_RIGHT:
					if (menuvram == NULL)
						mousemng_buttonevent(&e.button);
					break;

				case SDL_BUTTON_MIDDLE:
					if (np2oscfg.enable_menu) {
						if (menuvram == NULL)
							sysmenu_menuopen(0, e.button.x, e.button.y);
						else
							menubase_close();
					}
					break;
			}
			break;

		case SDL_MOUSEBUTTONDOWN:
			switch(e.button.button) {
				case SDL_BUTTON_LEFT:
					if (menuvram != NULL)
						menubase_moving(e.button.x, e.button.y, 1);
					else
						mousemng_buttonevent(&e.button);
					break;

				case SDL_BUTTON_RIGHT:
					if (menuvram == NULL)
						mousemng_buttonevent(&e.button);
					break;
			}
			break;

		case SDL_KEYDOWN:
			if (np2oscfg.enable_menu && e.key.keysym.scancode == SDL_SCANCODE_F11) {
				if (menuvram == NULL) {
					sysmenu_menuopen(0, 0, 0);
				}
				else {
					menubase_close();
				}
			}
			else {
				sdlkbd_keydown(e.key.keysym.scancode);
			}
			break;

		case SDL_KEYUP:
			sdlkbd_keyup(e.key.keysym.scancode);
			break;

		case SDL_QUIT:
			task_avail = FALSE;
			break;
		}
	}
}

BOOL taskmng_sleep(UINT32 tick) {

	UINT32	base;

	base = GETTICK();
	while((task_avail) && ((GETTICK() - base) < tick)) {
		taskmng_rol();
		SDL_Delay(1);
	}
	return(task_avail);
}


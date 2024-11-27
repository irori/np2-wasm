#include	"compiler.h"
#include	"mousemng.h"
#include	"np2.h"
#ifdef __EMSCRIPTEN__
#include	<emscripten/html5.h>
#endif

typedef struct {
	SINT16	x;
	SINT16	y;
	UINT8	btn;
#ifdef __EMSCRIPTEN__
	BOOL	captured;
#else
	UINT8	showcount;
#endif
} MOUSEMNG;

static	MOUSEMNG	mousemng;

static EM_BOOL on_pointerlockchange(int eventType, const EmscriptenPointerlockChangeEvent *e, void *userData) {
	if (!e->isActive)
		mousemng_showcursor();
	return EM_TRUE;
}

void mousemng_initialize(void) {
	ZeroMemory(&mousemng, sizeof(mousemng));
	mousemng.btn = uPD8255A_LEFTBIT | uPD8255A_RIGHTBIT;

#ifdef __EMSCRIPTEN__
	if (!np2oscfg.no_mouse) {
		// This must be called after SDL_CreateRenderer()
		emscripten_set_pointerlockchange_callback(EMSCRIPTEN_EVENT_TARGET_DOCUMENT, NULL, 0, on_pointerlockchange);
	}
#else
	mousemng.showcount = 1;
#endif
}

UINT8 mousemng_getstat(SINT16 *x, SINT16 *y, int clear) {
	*x = mousemng.x;
	*y = mousemng.y;
	if (clear) {
		mousemng.x = 0;
		mousemng.y = 0;
	}
	return(mousemng.btn);
}

void mousemng_hidecursor() {
#ifdef __EMSCRIPTEN__
	if (!np2oscfg.no_mouse) {
		mousemng.captured = !SDL_SetRelativeMouseMode(SDL_TRUE);
	}
#else
	if (!--mousemng.showcount) {
		SDL_ShowCursor(SDL_DISABLE);
		SDL_SetRelativeMouseMode(SDL_TRUE);
	}
#endif
}

void mousemng_showcursor() {
#ifdef __EMSCRIPTEN__
	if (!np2oscfg.no_mouse) {
		SDL_SetRelativeMouseMode(SDL_FALSE);
		mousemng.captured = FALSE;
	}
#else
	if (!mousemng.showcount++) {
		SDL_ShowCursor(SDL_ENABLE);
		SDL_SetRelativeMouseMode(SDL_FALSE);
	}
#endif
}

void mousemng_onmove(SDL_MouseMotionEvent *motion) {
#ifdef __EMSCRIPTEN__
	if (!mousemng.captured)
		return;
#endif

	mousemng.x += motion->xrel;
	mousemng.y += motion->yrel;
}

void mousemng_buttonevent(SDL_MouseButtonEvent *button) {
	UINT8 bit;

#ifdef __EMSCRIPTEN__
	if (!np2oscfg.no_mouse && !mousemng.captured) {
		if (button->button == SDL_BUTTON_LEFT && button->state == SDL_PRESSED)
			mousemng_hidecursor();
		return;
	}
#endif

	switch (button->button) {
	case SDL_BUTTON_LEFT:
		bit = uPD8255A_LEFTBIT;
		break;
	case SDL_BUTTON_RIGHT:
		bit = uPD8255A_RIGHTBIT;
		break;
	default:
		return;
	}
	if (button->state == SDL_PRESSED)
		mousemng.btn &= ~bit;
	else
		mousemng.btn |= bit;
}

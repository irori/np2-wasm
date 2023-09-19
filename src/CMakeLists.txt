cmake_minimum_required(VERSION 3.13)

project(Np2
  VERSION 0.86.0
  LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 11)

if (NOT EMSCRIPTEN)
  message(FATAL_ERROR "This CMakeLists.txt is for emscripten build only. Use with the emcmake command.")
endif()

# Np2 configure options.

option(ENABLE_WARNING "Enable warning [default=no]" NO)


# Checks for debug mode

add_compile_definitions(
  $<$<CONFIG:Debug>:DEBUG>
  $<$<CONFIG:Debug>:TRACE>
  $<$<CONFIG:Release>:NDEBUG>)


# Checks for warning

if (ENABLE_WARNING)
  string(APPEND CMAKE_C_FLAGS " -Wall -Wextra")
  string(APPEND CMAKE_C_FLAGS " -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith")
  string(APPEND CMAKE_C_FLAGS " -Wreturn-type -Wswitch -Wshadow")
  string(APPEND CMAKE_C_FLAGS " -Wcast-qual -Wwrite-strings")
  string(APPEND CMAKE_C_FLAGS " -Wno-unused-parameter -Wno-missing-field-initializers")
  string(APPEND CMAKE_C_FLAGS " -Wformat=2")
  string(APPEND CMAKE_CXX_FLAGS " -Wall -Wextra")
  string(APPEND CMAKE_CXX_FLAGS " -Wpointer-arith")
  string(APPEND CMAKE_CXX_FLAGS " -Wreturn-type -Wswitch -Wshadow")
  string(APPEND CMAKE_CXX_FLAGS " -Wcast-qual -Wwrite-strings")
  string(APPEND CMAKE_CXX_FLAGS " -Wno-unused-parameter -Wno-missing-field-initializers")
  string(APPEND CMAKE_CXX_FLAGS " -Wformat=2")
endif()

# --------------

add_library(np2_dependencies INTERFACE)

set(EM_LIBS "SHELL:-s USE_SDL=2")
target_compile_options(np2_dependencies INTERFACE ${EM_LIBS})
target_link_options(np2_dependencies INTERFACE
  ${EM_LIBS}
  "SHELL:-s ENVIRONMENT=web"
  "SHELL:-s MODULARIZE=1"
  "SHELL:-s EXPORT_ES6=1"
  "SHELL:-s EXPORTED_RUNTIME_METHODS=FS,ccall,UTF8ToString,stringToUTF8"
)

add_executable(np2)
target_link_libraries(np2 PRIVATE np2_dependencies)
install(TARGETS np2 RUNTIME DESTINATION bin)

find_package(ZLIB REQUIRED)
target_link_libraries(np2_dependencies INTERFACE ZLIB::ZLIB)

target_include_directories(np2_dependencies INTERFACE
  sdl2
  sdl2/emscripten
  embed
  embed/menu
  embed/menubase
)

set(PLATFORM_SOURCES
  sdl2/emscripten/main.c
  sdl2/commng.c
  sdl2/dosio.c
  sdl2/fontmng.c
  sdl2/ini.c
  sdl2/inputmng.c
  sdl2/joymng.c
  sdl2/mousemng.c
  sdl2/np2.c
  sdl2/scrnmng.c
  sdl2/sdlkbd.c
  sdl2/soundmng.cpp
  sdl2/sysmenu.c
  sdl2/sysmng.c
  sdl2/taskmng.c
  sdl2/timemng.c
  sdl2/trace.c

  common/arc.c
  common/arcunzip.c
  common/resize.c
  generic/cmver.c
  sound/opl3.c
  sound/opna.c

  embed/menubase/menuvram.c
  embed/menubase/menudlg.c
  embed/menubase/menusys.c
  embed/menubase/menures.c
  embed/menubase/menuicon.c
  embed/menubase/menumbox.c
  embed/menubase/menubase.c
  embed/vramhdl.c
  embed/vrammix.c
  embed/menu/menustr.c
  embed/menu/dlgabout.c
  embed/menu/dlgscr.c
  embed/menu/dlgcfg.c
  embed/menu/filesel.c
)

set(COMMON_SOURCES
  ${PLATFORM_SOURCES}

  pccore.c
  nevent.c
  calendar.c
  timing.c
  statsave.c
  keystat.c

  common/strres.c
  common/milstr.c
  common/_memory.c
  common/textfile.c
  common/profile.c
  common/rect.c
  common/lstarray.c
  common/bmpdata.c
  common/mimpidef.c
  common/parts.c
  common/wavefile.c

  codecnv/eucsjis.c
  codecnv/eucucs2.c
  codecnv/sjiseuc.c
  codecnv/sjisucs2.c
  codecnv/tcswap16.c
  codecnv/tcswap32.c
  codecnv/textcnv.c
  codecnv/ucs2sjis.c
  codecnv/ucs2utf8.c
  codecnv/utf8ucs2.c

  bios/bios.c
  bios/bios09.c
  bios/bios0c.c
  bios/bios12.c
  bios/bios13.c
  bios/bios18.c
  bios/bios19.c
  bios/bios1a.c
  bios/bios1b.c
  bios/bios1c.c
  bios/bios1f.c
  bios/sxsibios.c

  cbus/cbuscore.c
  cbus/pc9861k.c
  cbus/mpu98ii.c
  cbus/amd98.c
  cbus/board118.c
  cbus/board14.c
  cbus/board26k.c
  cbus/board86.c
  cbus/boardso.c
  cbus/boardspb.c
  cbus/boardx2.c
  cbus/cs4231io.c
  cbus/pcm86io.c
  cbus/sasiio.c
  cbus/scsiio.c
  cbus/scsicmd.c
  cbus/ideio.c
  cbus/atapicmd.c

  fdd/diskdrv.c
  fdd/newdisk.c
  fdd/fddfile.c
  fdd/fdd_xdf.c
  fdd/fdd_d88.c
  fdd/fdd_mtr.c
  fdd/sxsi.c
  fdd/sxsihdd.c
  fdd/sxsicd.c

  font/font.c
  font/fontdata.c
  font/fontmake.c
  font/fontpc88.c
  font/fontpc98.c
  font/fontv98.c
  font/fontfm7.c
  font/fontx1.c
  font/fontx68k.c

  generic/cmndraw.c
  generic/keydisp.c
  generic/cmjasts.c
  generic/hostdrv.c
  generic/hostdrvs.c
  generic/unasm.c
  generic/np2info.c
  generic/memdbg32.c
  generic/softkbd.c

  io/iocore.c
  io/artic.c
  io/cgrom.c
  io/cpuio.c
  io/crtc.c
  io/dipsw.c
  io/dmac.c
  io/egc.c
  io/emsio.c
  io/fdc.c
  io/fdd320.c
  io/gdc.c
  io/gdc_sub.c
  io/gdc_pset.c
  io/mouseif.c
  io/nmiio.c
  io/np2sysp.c
  io/pic.c
  io/pit.c
  io/printif.c
  io/serial.c
  io/sysport.c
  io/upd4990.c
  io/necio.c
  io/epsonio.c
  io/pcidev.c

  lio/lio.c
  lio/gscreen.c
  lio/gpset.c
  lio/gline.c
  lio/gcircle.c
  lio/gput1.c

  mem/dmav30.c
  mem/dmax86.c
  mem/memegc.c
  mem/memems.c
  mem/memepp.c
  mem/memtram.c
  mem/memvga.c
  mem/memvram.c

  sound/sound.c
  sound/soundrom.c
  sound/s98.c
  sound/adpcmc.c
  sound/adpcmg.c
  sound/beepc.c
  sound/beepg.c
  sound/cs4231c.c
  sound/cs4231g.c
  sound/fmboard.c
  sound/oplgenc.c
  sound/oplgeng.c
  sound/opngenc.c
  sound/opngeng.c
  sound/opntimer.c
  sound/pcm86c.c
  sound/pcm86g.c
  sound/pcmmix.c
  sound/psggenc.c
  sound/psggeng.c
  sound/rhythmc.c
  sound/sndcsec.c
  sound/tms3631c.c
  sound/tms3631g.c
  sound/getsnd/getsnd.c
  sound/getsnd/getsmix.c
  sound/getsnd/getmp3.c
  sound/getsnd/getogg.c
  sound/getsnd/getwave.c
  sound/vermouth/midiout.c
  sound/vermouth/midimod.c
  sound/vermouth/midinst.c
  sound/vermouth/midvoice.c
  sound/vermouth/midtable.c

  vram/vram.c
  vram/scrndraw.c
  vram/sdraw.c
  vram/dispsync.c
  vram/palettes.c
  vram/maketext.c
  vram/maketgrp.c
  vram/makegrph.c
  vram/makegrex.c
  vram/scrnsave.c
  )

target_sources(np2 PRIVATE ${COMMON_SOURCES})

target_include_directories(np2_dependencies INTERFACE
  .
  common
  cbus
  generic
  io
  mem
  sound
  vram
  )

# if HAVE_GCC
# AM_CFLAGS+=	-fno-strict-aliasing
# endif

if (SDL_FOUND)
  target_link_libraries(np2_dependencies INTERFACE PkgConfig::SDL)
endif()

set(I286C_SOURCES
  i286c/i286c.c
  i286c/cpumem.c
  i286c/i286c_mn.c
  i286c/i286c_ea.c
  i286c/i286c_0f.c
  i286c/i286c_8x.c
  i286c/i286c_sf.c
  i286c/i286c_f6.c
  i286c/i286c_fe.c
  i286c/i286c_rp.c
  i286c/v30patch.c
  debugsub.c
  )

set(IA32_SOURCES
  i386c/cpucore.c
  i386c/cpumem.c
  i386c/ia32/interface.c
  i386c/ia32/ia32.c
  i386c/ia32/cpu.c
  i386c/ia32/cpu_io.c
  i386c/ia32/cpu_mem.c
  i386c/ia32/ctrlxfer.c
  i386c/ia32/debug.c
  i386c/ia32/disasm.c
  i386c/ia32/exception.c
  i386c/ia32/groups.c
  i386c/ia32/inst_table.c
  i386c/ia32/paging.c
  i386c/ia32/resolve.c
  i386c/ia32/segments.c
  i386c/ia32/task.c
  i386c/ia32/instructions/bin_arith.c
  i386c/ia32/instructions/bit_byte.c
  i386c/ia32/instructions/ctrl_trans.c
  i386c/ia32/instructions/data_trans.c
  i386c/ia32/instructions/dec_arith.c
  i386c/ia32/instructions/flag_ctrl.c
  i386c/ia32/instructions/fpu.c
  i386c/ia32/instructions/logic_arith.c
  i386c/ia32/instructions/misc_inst.c
  i386c/ia32/instructions/seg_reg.c
  i386c/ia32/instructions/shift_rotate.c
  i386c/ia32/instructions/string_inst.c
  i386c/ia32/instructions/system_inst.c
  i386c/ia32/instructions/fpu/fpdummy.c
  debugsub386.c
)

add_executable(np21)
target_link_libraries(np21 PRIVATE np2_dependencies)

install(TARGETS np21 RUNTIME DESTINATION bin)
target_sources(np21 PRIVATE ${COMMON_SOURCES} ${IA32_SOURCES})

target_include_directories(np21 PRIVATE i386c)
target_compile_definitions(np21 PRIVATE CPUCORE_IA32)

target_sources(np2 PRIVATE ${I286C_SOURCES})
target_include_directories(np2 PRIVATE i286c)

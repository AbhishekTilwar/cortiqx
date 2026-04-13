/**
 * Hero grid GIFs and rabbit asset — single source of truth for preload + Hero.jsx.
 */
export const HERO_GIF_SOURCES = [
  'https://user-images.githubusercontent.com/62280849/128852791-6fb73a65-29a6-4c5e-84c5-e8372ac2bd77.gif',
  'https://camo.githubusercontent.com/d972b3fdd96f5bcda3cb22db4be78c78db577b6a4aa58d779523cc1f598f1e8d/68747470733a2f2f63646e2e6472696262626c652e636f6d2f75736572732f3733303730332f73637265656e73686f74732f363538313234332f6176656e746f2e676966',
  'https://images.ctfassets.net/eut50lk49cau/33bXbuQrjaBNOSsZbame0y/ebac078b34681040d5cd5b9c47efbcb9/No-codeemailpagebuildersfordevelopers-ezgif.com-optimize__1_.gif',
  'https://cdna.artstation.com/p/assets/images/images/073/492/620/original/umer-ahmed-developer-gif-animation.gif?1709777705',
  'https://raw.githubusercontent.com/ankitpriyarup/ankitpriyarup/master/coder.gif',
  'https://raw.githubusercontent.com/hasibul-hasan-shuvo/hasibul-hasan-shuvo/main/images/coding-boy.gif',
]

export const HERO_RABBIT_PNG =
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit.png'

/** Start fetching hero media as soon as the app bundle runs (pairs with index.html preloads). */
export function warmHeroAssets() {
  if (typeof window === 'undefined') return
  for (const src of HERO_GIF_SOURCES) {
    const img = new Image()
    img.src = src
  }
  const rabbit = new Image()
  rabbit.src = HERO_RABBIT_PNG
}

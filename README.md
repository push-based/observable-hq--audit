# Observable HQ - Performance Audit

---

## Initial state

To start with our audit we need the status quo.

Following measures where taken:
- Page refresh (a full page refresh triggeres over the performace panel)
- Page re-dom (a full removal and addinf back of the DOM)
- Page re-calculate (transformZ 0.1 on body)
- Page idle (after page is fully loaded some seconds of no interaction)

Following devices where erspected:
- Desktop

### Page refresh

### Findings

**Spcipting:**
- script dirven animations
- bad lib for DOM animation

**DOM & Styles:**
- animation noise
- styled components triggering refetch of resources

**Media:**
- no UI facade for hero GIF
- no lazy loading
- no compression
- wrong dimensions 

## Visual Areas

[Page view]()

**Areas:**
- tool-bar `document.querySelector('nav.bb')`
- section `document.querySelectorAll('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
  - hero-section `document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
- footer `document.querySelector('footer')`

## CSS only improvements

After my first impression of the flames and the fact that I **can't touch code nor assets** I decided to focus first on the things I can **easily test and measure**.
This includes runtime measures of DOM and CSS changes.

### `contain` and `content-visibility`

I start with the quick wins first and worked my way through the previously defined sections.

**Tool-bar**

The tool-bar is my first candidate. A clear case for `contain:strict` as (even if it self is without fixed dimensions, its first and only child is) we can assume static dimensiones. I did a check for mobile, to be shure it is the same there, which was the case: `height: 55px`.

The interactions with tool-bar elements did not show any animated changes nor dropdowns. The only thing interesting was, when I clicked the searchbox a full bage overlay showed up.

**Section**

The majority of the pages content is organized in sections with mid size DOM size. In general the site is media heavy but there are some specific sections containing more relevant animation or media we could have a look at. 



```css

/* too-bar */
nav.bb {
  contain: strict;
  height: 55px
}
```

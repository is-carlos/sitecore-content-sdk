# Figma Variables

<!--
Do not edit by hand.

Filled by `/is-frontend-figma-to-sitecore init` and refreshed by `/is-frontend-figma-to-sitecore variables`,
from the output of the skill's scripts/export-tokens.js (`variablesMarkdown`). It is an exact copy of the Figma file:
nothing interpreted or cleaned up. Committed so the whole team benefits.

Format: one table per variable collection, one column per mode. Colors are hex (RRGGBB, or RRGGBBAA
with alpha), numbers are as stored in Figma (px for sizes), aliases are `→ Collection/Variable`.

Example:

## Color Primitives

| Variable Name | Type | Default |
|---|---|---|
| Gray/900 | COLOR | 1A1A1A |
| White/500 | COLOR | FFFFFF |

## Color Tokens

| Variable Name | Type | Default | Dark |
|---|---|---|---|
| Text/Primary | COLOR | → Color Primitives/Gray/900 | → Color Primitives/White/500 |

## Spacing Tokens

| Variable Name | Type | Desktop | Mobile |
|---|---|---|---|
| Section/Padding | FLOAT | → Spacing/xmassive | → Spacing/huge |
-->

## Spacing Primitives

| Variable Name | Type | Value |
|---|---|---|
| none | FLOAT | 0 |
| xtiny | FLOAT | 4 |
| tiny | FLOAT | 8 |
| xxsmall | FLOAT | 12 |
| xsmall | FLOAT | 16 |
| small | FLOAT | 20 |
| medium | FLOAT | 24 |
| large | FLOAT | 28 |
| xlarge | FLOAT | 32 |
| xxlarge | FLOAT | 40 |
| huge | FLOAT | 48 |
| xhuge | FLOAT | 56 |
| xxhuge | FLOAT | 64 |
| xxxhuge | FLOAT | 72 |
| massive | FLOAT | 80 |
| xmassive | FLOAT | 96 |
| neg-massive | FLOAT | -80 |

## Typography

| Variable Name | Type | Desktop | Mobile |
|---|---|---|---|
| Font Family/Heading | STRING | Source Sans Pro | Source Sans Pro |
| Font Family/Body | STRING | Source Sans Pro | Source Sans Pro |
| Font Size/Heading/XXL | FLOAT | 100 | 58 |
| Font Size/Heading/XL | FLOAT | 64 | 28 |
| Font Size/Heading/L | FLOAT | 40 | 24 |
| Font Size/Heading/M | FLOAT | 32 | 22 |
| Font Size/Heading/S | FLOAT | 28 | 20 |
| Font Size/Heading/XS | FLOAT | 22 | 18 |
| Font Size/Body/L | FLOAT | 20 | 18 |
| Font Size/Body/M | FLOAT | 16 | 13 |
| Font Size/Body/S | FLOAT | 14 | 12 |
| Font Family/Accent | STRING | Space Grotesk | Space Grotesk |

## Color Primitives

| Variable Name | Type | Mode 1 |
|---|---|---|
| White/500 | COLOR | FFFFFF |
| Gray/100 | COLOR | F6F5F2 |
| Gray/200 | COLOR | EAEAEC |
| Gray/300 | COLOR | ADB4BC |
| Gray/500 | COLOR | 959395 |
| Gray/700 | COLOR | 6D6E72 |
| Gray/900 | COLOR | 1A1A1A |
| Black/500 | COLOR | 000000 |
| Blue/700 | COLOR | 1D2049 |
| Blue/500 | COLOR | 16264A |
| Blue/400 | COLOR | 1E3A6E |
| Gold/400 | COLOR | FEEAB5 |
| Gold/500 | COLOR | E8CF79 |
| Yellow/100 | COLOR | FEFEEF |
| Yellow/300 | COLOR | FCF7A4 |
| Yellow/500 | COLOR | F8ED33 |
| Yellow/700 | COLOR | FDBD11 |
| Coral/500 | COLOR | F47B58 |
| Teal/500 | COLOR | 018F81 |
| Burgundy/500 | COLOR | 5B2249 |
| Blue/300 | COLOR | 004E7C |
| Blue/200 | COLOR | 99CAEA |
| Red/100 | COLOR | FDECED |
| Red/200 | COLOR | F4959A |
| Orange/100 | COLOR | FFF9F0 |
| Orange/200 | COLOR | FFF4EB |
| Orange/300 | COLOR | FEDCAA |
| Orange/350 | COLOR | FFBF8D |
| Orange/400 | COLOR | FCB040 |
| Green/100 | COLOR | EFF9F1 |
| Green/200 | COLOR | F6FAF0 |
| Green/300 | COLOR | A7DEAE |
| Green/400 | COLOR | 8EC63E |
| Green/500 | COLOR | 3AB54A |
| Green/600 | COLOR | 019444 |
| Orange/500 | COLOR | FE7000 |
| Orange/600 | COLOR | E65332 |
| Orange/700 | COLOR | D53D1A |
| Red/500 | COLOR | E7131D |
| Magenta (Figma grids)/500 | COLOR | A900C3 |
| Lime (Figma notes)/200 | COLOR | DDF6C0 |
| Lime (Figma notes)/300 | COLOR | C3F58B |
| Red/600 | COLOR | A91923 |
| Red/700 | COLOR | 852E33 |
| Burgundy/700 | COLOR | 281F2D |
| Coral/700 | COLOR | D04125 |
| Coral/800 | COLOR | A43C3E |
| Coral/900 | COLOR | 803044 |

## Spacing Tokens

| Variable Name | Type | Desktop | Mobile |
|---|---|---|---|
| Section/Padding | FLOAT | → Spacing Primitives/xmassive | → Spacing Primitives/huge |
| Component/Gap | FLOAT | → Spacing Primitives/xlarge | → Spacing Primitives/medium |
| Element/Gap | FLOAT | → Spacing Primitives/medium | → Spacing Primitives/small |
| Hero/Gap | FLOAT | → Spacing Primitives/xmassive | → Spacing Primitives/huge |
| Hero/Hero-to-Content Gap | FLOAT | → Spacing Primitives/xxhuge | → Spacing Primitives/medium |
| Interactive/Element-Gap | FLOAT | → Spacing Primitives/tiny | → Spacing Primitives/tiny |
| Interactive/Horizontal Padding | FLOAT | → Spacing Primitives/small | → Spacing Primitives/small |
| Interactive/Vertical Padding | FLOAT | → Spacing Primitives/xsmall | → Spacing Primitives/xsmall |
| Rhythm/Block | FLOAT | → Spacing Primitives/xxlarge | → Spacing Primitives/xxlarge |
| Rhythm/Stack | FLOAT | → Spacing Primitives/xsmall | → Spacing Primitives/xsmall |
| Rhythm/List-Items | FLOAT | → Spacing Primitives/xlarge | → Spacing Primitives/xlarge |
| Rhythm/Group | FLOAT | → Spacing Primitives/small | → Spacing Primitives/small |
| Rhythm/Compact | FLOAT | → Spacing Primitives/xxsmall | → Spacing Primitives/xxsmall |
| Rhythm/Section | FLOAT | → Spacing Primitives/xhuge | → Spacing Primitives/xhuge |
| Modal/Form Field Gap | FLOAT | → Spacing Primitives/medium | 0 |
| Special/Component Image Grid-Overlap Space | FLOAT | 104 | 0 |
| Special/Component Image Grid-2up and 3up Element Gap | FLOAT | → Spacing Primitives/xxhuge | 0 |

## Grid System

| Variable Name | Type | Desktop | Mobile |
|---|---|---|---|
| Page Columns | FLOAT | 36 | 6 |
| Page Margins | FLOAT | 80 | 16 |
| Viewport Width | FLOAT | 1600 | 360 |
| Component Widths/Full | FLOAT | → Grid System/Viewport Width | → Grid System/Viewport Width |
| Component Widths/Large | FLOAT | 1440 | 328 |
| Component Widths/Medium | FLOAT | 1120 | 328 |
| Component Widths/Small | FLOAT | 800 | 328 |

## Color Tokens

| Variable Name | Type | Normal | On Dark |
|---|---|---|---|
| Figma/Guides | COLOR | → Color Primitives/Magenta (Figma grids)/500 | → Color Primitives/Magenta (Figma grids)/500 |
| Figma/Documentation Background | COLOR | → Color Primitives/Lime (Figma notes)/200 | → Color Primitives/Lime (Figma notes)/200 |
| Figma/Documentation Border | COLOR | → Color Primitives/Lime (Figma notes)/300 | → Color Primitives/Lime (Figma notes)/300 |
| Text/Primary | COLOR | → Color Primitives/Gray/900 | → Color Primitives/White/500 |
| Text/Secondary | COLOR | → Color Primitives/Gray/700 | → Color Primitives/Gray/300 |
| Text/Brand | COLOR | → Color Primitives/Blue/400 | → Color Primitives/White/500 |
| Text/Invert | COLOR | → Color Primitives/White/500 | → Color Primitives/White/500 |
| Text/Disabled | COLOR | → Color Primitives/Gray/500 | → Color Primitives/Gray/700 |
| Surface/Default | COLOR | → Color Primitives/White/500 | → Color Primitives/Blue/500 |
| Surface/Subtle | COLOR | → Color Primitives/Gray/100 | → Color Primitives/Gray/900 |
| Surface/Brand | COLOR | → Color Primitives/Blue/500 | → Color Primitives/White/500 |
| Surface/Urgent | COLOR | → Color Primitives/Gold/400 | → Color Primitives/Gold/400 |
| Interactive/Default | COLOR | → Color Primitives/Blue/500 | → Color Primitives/White/500 |
| Interactive/Hover | COLOR | → Color Primitives/Blue/400 | → Color Primitives/Gold/400 |
| Border/Default | COLOR | → Color Primitives/Gray/700 | → Color Primitives/White/500 |
| Border/Subtle | COLOR | → Color Primitives/Gray/300 | → Color Primitives/Gray/500 |
| Border/Subtle AA | COLOR | → Color Primitives/Gray/500 | → Color Primitives/Gray/500 |
| Status/Error | COLOR | → Color Primitives/Red/500 | → Color Primitives/Red/600 |
| Interactive/Secondary | COLOR | → Color Primitives/Blue/500 | → Color Primitives/White/500 |
| Interactive/Icons and Underlines | COLOR | → Color Primitives/Orange/700 | → Color Primitives/Yellow/700 |
| Interactive/Disabled Icons | COLOR | → Color Primitives/Gray/500 | → Color Primitives/Gray/700 |
| Interactive/Secondary/Hover | COLOR | → Color Primitives/Blue/400 | → Color Primitives/Gray/100 |
| Interactive/Link/Default | COLOR | → Color Tokens/Interactive/Default | → Color Tokens/Interactive/Default |
| Interactive/Link/Hover | COLOR | → Color Tokens/Interactive/Hover | → Color Tokens/Interactive/Hover |
| Surface/Transparent | COLOR | FFFFFF3D | FFFFFF3D |
| Border/Row Subtle | COLOR | → Color Primitives/Gray/200 | → Color Primitives/Gray/200 |
| Grid Conditions/Baseline Normal/Main | COLOR | → Color Primitives/Green/600 | FFFFFF |
| Grid Conditions/Baseline Normal/Secondary | COLOR | → Color Primitives/Green/300 | FFFFFF |
| Grid Conditions/Baseline Normal/BG | COLOR | → Color Primitives/White/500 | FFFFFF |
| Grid Conditions/Weather Advisory/Main | COLOR | → Color Primitives/Green/500 | FFFFFF |
| Grid Conditions/Weather Advisory/Secondary | COLOR | → Color Primitives/Green/300 | FFFFFF |
| Grid Conditions/Weather Advisory/BG | COLOR | → Color Primitives/Green/100 | FFFFFF |
| Grid Conditions/Resource Advisory/Main | COLOR | → Color Primitives/Green/400 | FFFFFF |
| Grid Conditions/Resource Advisory/Secondary | COLOR | → Color Primitives/Green/300 | FFFFFF |
| Grid Conditions/Resource Advisory/BG | COLOR | → Color Primitives/Green/200 | FFFFFF |
| Grid Conditions/Conservative Op Advisory/Main | COLOR | → Color Primitives/Yellow/500 | FFFFFF |
| Grid Conditions/Conservative Op Advisory/Secondary | COLOR | → Color Primitives/Yellow/300 | FFFFFF |
| Grid Conditions/Conservative Op Advisory/BG | COLOR | → Color Primitives/Yellow/100 | FFFFFF |
| Grid Conditions/Emergency Alert 1/Main | COLOR | → Color Primitives/Orange/400 | FFFFFF |
| Grid Conditions/Emergency Alert 1/Secondary | COLOR | → Color Primitives/Orange/300 | FFFFFF |
| Grid Conditions/Emergency Alert 1/BG | COLOR | → Color Primitives/Orange/100 | FFFFFF |
| Grid Conditions/Emergency Alert 2/Main | COLOR | → Color Primitives/Orange/500 | FFFFFF |
| Grid Conditions/Emergency Alert 2/Secondary | COLOR | → Color Primitives/Orange/350 | FFFFFF |
| Grid Conditions/Emergency Alert 2/BG | COLOR | → Color Primitives/Orange/200 | FFFFFF |
| Grid Conditions/Emergency Alert 3/Main | COLOR | → Color Primitives/Red/500 | FFFFFF |
| Grid Conditions/Emergency Alert 3/Secondary | COLOR | → Color Primitives/Red/200 | FFFFFF |
| Grid Conditions/Emergency Alert 3/BG | COLOR | → Color Primitives/Red/100 | FFFFFF |
| Grid Conditions/Outage/Main | COLOR | → Color Primitives/Gray/700 | FFFFFF |
| Grid Conditions/Outage/Secondary | COLOR | → Color Primitives/Gray/300 | FFFFFF |
| Grid Conditions/Outage/BG | COLOR | → Color Primitives/Gray/100 | FFFFFF |
| Footer/Footer | COLOR | → Color Primitives/Black/500 | → Color Primitives/Black/500 |
| Footer/Gradient Stop A | COLOR | → Color Primitives/Red/700 | → Color Primitives/Red/700 |
| Footer/Gradient Stop B | COLOR | → Color Primitives/Burgundy/500 | → Color Primitives/Burgundy/500 |
| Footer/Gradient Stop C | COLOR | → Color Primitives/Burgundy/700 | → Color Primitives/Burgundy/700 |
| Grid Conditions/Border | COLOR | DCE9E8 | DCE9E8 |
| Grid Conditions/Chart/1 | COLOR | 6897C3 | 6897C3 |
| Grid Conditions/Chart/2 | COLOR | 8FAFCE | 8FAFCE |
| Grid Conditions/Chart/3 | COLOR | 298CB2 | 298CB2 |
| Grid Conditions/Chart/4 | COLOR | FBAB19 | FBAB19 |
| Grid Conditions/Chart/5 | COLOR | F3742C | F3742C |

## Other

| Variable Name | Type | Desktop | Mobile |
|---|---|---|---|
| Border Radius/L | FLOAT | 12 | 8 |
| Border Radius/S | FLOAT | 4 | 4 |
| Border Radius/Circle | FLOAT | 1000 | 1000 |

## Gradient Tokens

| Variable Name | Type | Mode 1 |
|---|---|---|
| Brand/Primary/A | COLOR | → Color Primitives/Blue/700 |
| Brand/Primary/B | COLOR | → Color Primitives/Burgundy/500 |
| Brand/Primary/C | COLOR | → Color Primitives/Orange/600 |
| Brand/Primary/D | COLOR | → Color Primitives/Yellow/700 |
| Hero/A | COLOR | → Color Primitives/Coral/700 |
| Hero/B | COLOR | → Color Primitives/Coral/800 |
| Hero/C | COLOR | → Color Primitives/Burgundy/500 |
| Hero/D | COLOR | → Color Primitives/Blue/700 |

# Storipress fonts book

These are all available fonts for Storipress.

## 事前準備
1. `brew install woff2`
1. 從 Google Font 新增字體
1. 下載以下這 4 種字型
   - Regular 400
   - Regular 400 Italic
   - Bold 700
   - Bold 700 Italic
1. 在字型的資料夾中，執行 `ls *.ttf | xargs -n 1 woff2_compress`  轉換資料夾下的字型變成 woff2
1. 照著檔名規則重新命名檔案
   > ex: `Open Sauce Sans [Bold Italic].woff2`

## Update steps
1. add font files to `fonts` directory
  1. ensure your fonts follow the name conventions
2. run `yarn build` and `yarn test` to verify
3. push to github
4. merge release branch to master
5. manually publish packages/fonts-meta to github
6. use fonts-showcase repo to verify fonts are working
7. update builder
   1. update @storipress/fonts-meta version
   2. update the fonts css public/index.html
8. update generator
   1. update fonts css
9. publish builder with manager-next

## About webpack

NEVER touch it. It's optimized to handle font building. Never try to replace it with vite or other tools. They are not flexible enough.

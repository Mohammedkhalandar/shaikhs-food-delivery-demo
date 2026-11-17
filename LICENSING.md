# Media and code licensing review

The seven food images and favicon are generated from the original geometric SVGs in `artwork`. They contain no external photograph, downloaded brand graphic or font binary. The favicon is a new raster derivative of the CC0 biryani illustration, not the private application's monogram icon. `ASSET_MANIFEST.json` records exact reviewed hashes and source SVGs. The scoped CC0-1.0 dedication is in `artwork/LICENSE.txt`; it permits reuse of these new illustrations, including commercial use, subject to the [CC0 terms and limitations](https://creativecommons.org/publicdomain/zero/1.0/). It does not grant rights in unrelated code or trademarks. The original seven unverified photographs are absent.

The client uses system font family names, without shipping font files, Google Fonts requests or third-party browser libraries. The browser artifact has zero npm runtime dependencies. Locked development tools are Playwright 1.65.0 (Apache-2.0), axe Playwright 4.14.0 (MPL-2.0), ESLint 9.39.5 (MIT), and js-yaml 4.3.2 (MIT), as confirmed from their installed package metadata. Their dependencies/notices remain in npm packages and are not copied into `dist`; preserve relevant licenses if changing that distribution scope.

## Authorized owner decision

The owner explicitly authorized public publication and GitHub Pages hosting, with All Rights Reserved for original demo code and branding. LICENSE records that decision; package.json uses UNLICENSED to avoid implying an open-source grant. The scoped CC0 illustration dedication and third-party license grants remain intact. No trademark permission is implied by the artwork dedication. This decision applies only to this demonstration, not the private application's history or unrelated material. See THIRD_PARTY_NOTICES.md and the unchanged upstream license copies under third-party-licenses/.

No original private Git history, personal author identity, private operational reports, old CI logs or full application source is included in this demo-only candidate. Do not make the existing private application repository public as a substitute for publishing this clean folder.

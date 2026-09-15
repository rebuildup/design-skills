# Information Density References

Last reviewed: 2026-09-16

この reference set は「compact = 小さいUI」という単純化を避けるため、density mode、dense data surface、spacing foundation、target constraints を異なる first-party source で比較する。

## SAP Fiori — Responsiveness / Content Density

- https://www.sap.com/design-system/fiori-design-web/v1-148/discover/sap-design-system/vision-and-mission/responsiveness-adaptiveness
- Type: official design-system guidance
- Current status at review: Fiori Design Web v1.148 current documentation opened 2026-09-16.
- Observe:
  - desktop では compact、touch device では finger-friendly cozy を使う current responsive example
  - density と responsive transformation を同一視せず、filter collapse や responsive table adaptation と別軸で扱う構造
  - input capability と available space の双方が surface adaptation に影響すること
- Useful for:
  - density を viewport breakpoint だけで決めず、input / task / responsive structure と分離して判断するとき
- Avoid copying:
  - SAP 固有 mode 名、exact dimensions、device classification を universal rule にしない

## SAP UI5 — How to Use Densities for Controls

- https://help.sap.com/docs/SAPUI5/7d0efeaa9ccd4731afb386284cfdc3a9/13e6f3bfc54c4bd7952403e20ff447e7.html
- Type: official implementation guidance
- Current status at review: current SAP Help page opened 2026-09-16.
- Observe:
  - Cozy は larger dimensions / spacing、Compact は reduced-size controls として区別されること
  - mixed mouse + touch environment では launchpad が user-configurable density を持てること
  - density が container hierarchy へ適用され、popup / dialog も surrounding density と整合させる必要があること
- Useful for:
  - mixed-input preference、local mismatch、overlay mismatch を確認するとき
- Avoid copying:
  - framework CSS class や inheritance mechanics を design source of truth にしない

## Carbon Design System — Data Table / Usage

- https://carbondesignsystem.com/components/data-table/usage/
- Type: official design-system usage guidance
- Current status at review: current Carbon documentation opened 2026-09-16.
- Observe:
  - same semantic table に複数 row size があり、expected line count と task context に応じて選べること
  - toolbar / header / row / pagination を一つの dense operational surface として整合させること
  - table を狭い nested container に押し込み truncation を増やすことを避ける guidance
- Useful for:
  - information-per-view と geometric density を分離しつつ dense comparison surface を構成するとき
- Avoid copying:
  - Carbon 固有 row height、gutter、token value を他 system の既定値にしない

## Carbon Design System — Text Input / Usage

- https://carbondesignsystem.com/components/text-input/usage/
- Type: official design-system component guidance
- Current status at review: current Carbon documentation opened 2026-09-16.
- Observe:
  - small / medium / large input size を available space と form complexity に応じて選ぶこと
  - one density value を全 control に機械適用するのではなく、task / composition に応じた size variant が存在すること
  - paired form controls では height consistency を保つこと
- Useful for:
  - compact operational surface と reading/input comfort の trade-off を比較するとき

## Atlassian Design System — Spacing

- https://atlassian.design/foundations/spacing
- Type: official design-system foundation
- Current status at review: current page crawled 2026-09-16.
- Observe:
  - constrained spacing scale が consistency を作る方法
  - small spacing が compact UI、larger spacing が less-dense UI に使われる一方、whitespace が grouping / hierarchy も担うこと
  - repeated spacing が scan rhythm を作り、variation が attention / grouping を作ること
- Useful for:
  - density variant を random pixel reduction ではなく system-level spacing relationship として作るとき
- Avoid copying:
  - 8px base unit や token names を universal rule にしない

## Atlassian Design System — Button

- https://atlassian.design/guidelines/product/components/buttons
- Type: official component guidance
- Current status at review: current page opened 2026-09-16.
- Observe:
  - default spacing を通常利用し、compact spacing を table 等の surrounding context に応じて使う例
  - compact variant が global aesthetic ではなく local task context に属すること
- Useful for:
  - component-local density variant と application-wide density mode を分けるとき

## UI5 Web Components — Content Density

- https://ui5.github.io/webcomponents/docs/development/styling/
- Type: official public implementation guidance
- Current status at review: current documentation opened 2026-09-16.
- Observe:
  - Cozy を touch-oriented、Compact を visible-content量が重要な desktop / complex dashboard context と結び付けること
  - component styling が density mode に応じて変わる実装モデル
- Useful for:
  - same design language 内で input / task に応じて density を変える production evidence
- Avoid copying:
  - CSS variables / framework implementationを design source of truth にしない

## W3C WAI — WCAG 2.2 Target Size (Minimum)

- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Type: official accessibility guidance for WCAG 2.2 SC 2.5.8
- Status at review: current WCAG 2.2 Understanding documentation; rechecked 2026-09-16.
- Observe:
  - target size と spacing の constraint
  - visible glyph size と interactive target の区別
  - small-target exceptions と adjacent-target risk
  - minimum conformance requirement と comfortable design target が同一ではないこと
- Useful for:
  - compact mode が operational reliability を壊していないか確認するとき
- Avoid copying:
  - minimum conformance value を「推奨 compact component size」へ読み替えない

## Cross-reference comparison

### Repeated findings

複数 source で繰り返されるのは次の構造:

1. **Density is contextual.** Data-heavy / repeated-operation context では compact variant が有効だが、すべての surface を一律に圧縮する根拠にはならない。
2. **Information density and geometry are separable.** 同じ task / semantics のまま row / control / spacing variants を変えられる一方、必要情報そのものを隠すことは別の decision である。
3. **Density benefits from a system.** SAP の mode、Carbon の named sizes、Atlassian の spacing scale は、ad-hoc な局所圧縮を避ける。
4. **Input and user constraints matter.** SAP は touch / pointer と hybrid preference、W3C は target reliability を別 constraint として示す。
5. **Whitespace is not waste.** Atlassian の spacing guidance が示すように、spacing は grouping / hierarchy / rhythm も担うため、削減量だけでは quality を測れない。
6. **More items visible is not sufficient proof.** hierarchy、target reliability、scanability、task flow を同時に確認する必要がある。

### Important differences

- SAP Fiori は density を input capability と application/system behavior に強く結び付ける。
- Carbon は component-level size variants と dense data surface の整合を first-class に扱う。
- Atlassian は spacing foundation と local compact component variantsから density を構成する。
- UI5 Web Components は同一 component system 内で Cozy / Compact を実装する production evidence を与える。
- WCAG は density style を定義せず、pointer target reliability の最低 constraint を定義する。

この差分から、一つの design system の density model を universal rule にせず、**task / simultaneous information need / surface scope / input / user preference / hierarchy** を observation axes として current product へ翻訳する。

## Failure modes to inspect

- font size まで一律縮小し readable hierarchy を失う
- compact control の visible icon と hit target の両方を小さくし adjacent errors を増やす
- row は compact なのに menu / dialog / overlay だけ comfortable で spatial rhythm が崩れる
- 全 surface を一律 compact にし reading / input task まで圧縮する
- density mode ごとに情報や機能を不用意に消し、layout preference が capability difference になる
- padding を減らす一方で redundant container / border / metadata を残し、情報効率が上がらない
- comparison に必要な metadata を disclosure の奥へ移し、viewport は空いたが task cost が増える
- compact screenshot だけ確認し、zoom / long labels / keyboard / touch / real data を試さない

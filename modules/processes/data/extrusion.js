// 六步核心流程；補充分支另列，不計入步驟總數。
export const steps = [
  {
    "id": "01",
    "zh": {
      "name": "備料與預熱",
      "tagline": "先確認材料，再開始生產。",
      "purpose": "準備符合產品需求的鋁料與模具，讓材料進入適合成形的狀態。",
      "description": "鋁棒經預熱後送入擠型設備；模具準備是並行工作。",
      "insight": "先依產品性能選擇鋁料。6 系列是常見的擠型合金，但仍需依用途確認；來料經檢驗確認後才能投入生產。",
      "check": "核對材料標示、檢驗結果與模具版本。"
    },
    "en": {
      "name": "Material preparation & preheating",
      "tagline": "Choose the material before production begins.",
      "purpose": "Prepare the billet and tooling for the product requirements and forming process.",
      "description": "The billet is preheated before entering the press. Tooling preparation runs in parallel.",
      "insight": "Select the alloy to meet product performance needs. The 6xxx series is common in extrusion, but suitability still depends on the application. Incoming material must pass inspection before use.",
      "check": "Verify material identification, incoming inspection results, and tooling revisions."
    },
    "source": [
      "AEC · Glossary",
      "https://aec.org/glossary"
    ]
  },
  {
    "id": "02",
    "zh": {
      "name": "擠型成形",
      "tagline": "讓截面設計成為型材。",
      "purpose": "形成產品需要的截面形狀。",
      "description": "預熱鋁棒受壓通過模具開口，形成連續型材。",
      "insight": "製程銜接要能說明目前生產版本、異常由誰回報，以及哪些批次可能受到影響。",
      "check": "確認版本與異常回報窗口。"
    },
    "en": {
      "name": "Extrusion",
      "tagline": "Turn a cross-section into a profile.",
      "purpose": "Form the required cross-section.",
      "description": "Pressure forces the preheated billet through a die opening to form a profile.",
      "insight": "Handoffs should clarify the production revision, issue-reporting contacts, and potentially affected lots.",
      "check": "Confirm the revision and issue-reporting contacts."
    },
    "source": [
      "Hydro · Extrusion process",
      "https://www.hydro.com/us/us/aluminum/products/extruded-profiles/north-america-resources/extruded-aluminum-products/what-is-extruded-aluminum/aluminum-extrusion-process/"
    ]
  },
  {
    "id": "03",
    "zh": {
      "name": "冷卻／淬火",
      "tagline": "冷卻方式也影響後續品質。",
      "purpose": "依材料與產品要求控制冷卻。",
      "description": "型材離開擠型設備後冷卻；淬火有特定的冶金目的，不等同於一般降溫。",
      "insight": "保留製程紀錄與批次關聯，出現異常時才能縮小調查範圍。",
      "check": "追蹤冷卻紀錄與搬運保護。"
    },
    "en": {
      "name": "Cooling & quenching",
      "tagline": "Cooling conditions matter downstream.",
      "purpose": "Control cooling according to material and product requirements.",
      "description": "Profiles are cooled after extrusion. Quenching has a specific metallurgical purpose and is distinct from general cooling.",
      "insight": "Keep process records linked to lots so investigations can narrow the affected scope.",
      "check": "Track cooling records and handling protection."
    },
    "source": [
      "AEC · Glossary",
      "https://aec.org/glossary"
    ]
  },
  {
    "id": "04",
    "zh": {
      "name": "拉伸矯直",
      "tagline": "把形狀要求帶到下一工序。",
      "purpose": "修正型材直線度與形狀。",
      "description": "冷卻後以拉伸等方式進行矯直，方法依產品需求確認。",
      "insight": "品質回饋要連結後續裝配需求，而不只停留在單一工序的檢查紀錄。",
      "check": "關注直線度、扭曲與裝配回饋。"
    },
    "en": {
      "name": "Stretching & straightening",
      "tagline": "Carry geometry requirements into the next step.",
      "purpose": "Correct profile straightness and shape.",
      "description": "After cooling, profiles are straightened by stretching or other product-appropriate methods.",
      "insight": "Connect quality feedback to downstream assembly needs rather than treating each operation in isolation.",
      "check": "Review straightness, twist, and assembly feedback."
    },
    "source": [
      "AEC · Glossary",
      "https://aec.org/glossary"
    ]
  },
  {
    "id": "05",
    "zh": {
      "name": "定尺鋸切",
      "tagline": "尺寸之外，治具同樣關鍵。",
      "purpose": "取得符合需求的型材長度。",
      "description": "依需求將型材鋸切至指定長度；後續加工裁切可能另有工序。",
      "insight": "在梯具製造經驗中，腳管與踏板的裁切特別重視治具的正確設置；這個觀點也延伸至焊接與鉚釘組裝等後續加工。",
      "check": "核對長度、數量與治具設置。"
    },
    "en": {
      "name": "Cutting to length",
      "tagline": "Fixtures matter as much as dimensions.",
      "purpose": "Produce the required profile lengths.",
      "description": "Saw-cut profiles to the required lengths. Further fabrication may involve additional cutting operations.",
      "insight": "In my ladder manufacturing experience, cutting leg tubes and steps required particular attention to correct fixture setup. This also extends to downstream welding and riveted assembly.",
      "check": "Check lengths, quantities, and fixture setup."
    },
    "source": [
      "Hydro · Extrusion process",
      "https://www.hydro.com/us/us/aluminum/products/extruded-profiles/north-america-resources/extruded-aluminum-products/what-is-extruded-aluminum/aluminum-extrusion-process/"
    ]
  },
  {
    "id": "06",
    "zh": {
      "name": "時效處理",
      "tagline": "以材料要求完成性能銜接。",
      "purpose": "依材料與交付需求調整性能。",
      "description": "時效可分自然時效與人工時效；適用方式依材料與產品要求確認。",
      "insight": "將處理紀錄、檢測回報與可交付時間串聯，確認何時可以銜接下一站。",
      "check": "確認處理紀錄與下一站進度。"
    },
    "en": {
      "name": "Ageing",
      "tagline": "Develop properties for the required application.",
      "purpose": "Develop properties according to material and delivery requirements.",
      "description": "Ageing may be natural or artificial. The applicable route depends on the material and product requirements.",
      "insight": "Connect treatment records, test feedback, and readiness dates to confirm the next handoff.",
      "check": "Confirm treatment records and readiness for the next operation."
    },
    "source": [
      "AEC · Glossary",
      "https://aec.org/glossary"
    ]
  }
];

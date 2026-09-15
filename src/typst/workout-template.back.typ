#set page(width: 210mm, height: 297mm, margin: (x: 16mm, y: 15mm))
#set text(size: 11pt, lang: "fr")

#let type-colors = (
  "Physique": (accent: rgb(249, 115, 22),  light: rgb(255, 240, 230), text: rgb(124, 45, 18)),
  "Endurance": (accent: rgb(59, 130, 246), light: rgb(219, 234, 254), text: rgb(30, 64, 175)),
  "Apnée": (accent: rgb(99, 102, 241),    light: rgb(232, 234, 255), text: rgb(76, 29, 149)),
  "Technique": (accent: rgb(168, 85, 247), light: rgb(244, 236, 255), text: rgb(107, 33, 168)),
  "Mixte": (accent: rgb(20, 184, 166),     light: rgb(222, 247, 236), text: rgb(13, 148, 136)),
  "Vitesse": (accent: rgb(239, 68, 68),    light: rgb(254, 226, 226), text: rgb(153, 27, 27)),
  "Récupération": (accent: rgb(34, 197, 94), light: rgb(220, 252, 231), text: rgb(22, 101, 52)),
)

#let exercise-palette-map = (
  "warmup":    (bg: rgb(219, 234, 254), border: rgb(191, 219, 254), text: rgb(30, 64, 175)),
  "arms":      (bg: rgb(207, 250, 254), border: rgb(165, 243, 252), text: rgb(8, 145, 178)),
  "legs":      (bg: rgb(224, 231, 255), border: rgb(191, 219, 254), text: rgb(37, 99, 235)),
  "fins":      (bg: rgb(204, 251, 241), border: rgb(167, 243, 208), text: rgb(14, 116, 144)),
  "intense":   (bg: rgb(255, 237, 213), border: rgb(254, 215, 170), text: rgb(180, 83, 9)),
  "recovery":  (bg: rgb(220, 252, 231), border: rgb(187, 247, 208), text: rgb(22, 101, 52)),
  "technical": (bg: rgb(237, 233, 254), border: rgb(221, 214, 254), text: rgb(109, 40, 217)),
  "fullbody":  (bg: rgb(224, 231, 255), border: rgb(199, 210, 254), text: rgb(67, 56, 202)),
)

#let default-exercise-palette = (bg: rgb(241, 245, 249), border: rgb(203, 213, 225), text: rgb(51, 65, 85))
#let water-icon = "〰" // symbole utilisé dans le bandeau de distance totale (rendu dépendant des polices, Typst fournit un fallback)

#let pill(label, palette) = box(
  inset: (x: 8pt, y: 4pt),
  radius: 8pt,
  fill: palette.bg,
  stroke: (paint: palette.border, thickness: 0.8pt),
)[
  #set text(size: 9pt, weight: "semibold", fill: palette.text)
  #label
]

#let dot(color) = box(width: 9pt, height: 9pt, radius: 10pt, fill: color)

#let workout-header(workout, accent) = box(
  fill: accent.light,
  stroke: (paint: accent.accent, thickness: 0.8pt),
  radius: 12pt,
  inset: 14pt,
)[
  #let sections = workout.at("sections", default: ())
  #let section-count = sections.len()
  #stack(spacing: 8pt, [
    #grid(columns: (auto, 1fr, auto), gutter: 10pt)[
      #box(width: 20pt, height: 20pt, radius: 12pt, fill: accent.accent)
      #stack(spacing: 4pt)[
        #text(workout.name, size: 18pt, weight: "bold", fill: accent.text)
        #let date = workout.at("created-at", default: none)
        #if (date != none and date != "") [
          #text("Créé le " + date, size: 10pt, fill: rgb(71, 85, 105))
        ]
      ]
      #pill(
        "Sections : " + str(section-count),
        (bg: accent.light, border: accent.accent, text: accent.accent),
      )
    ]
    #pill(
      "Type : " + workout.type,
      (bg: rgb(239, 246, 255), border: rgb(191, 219, 254), text: accent.text),
    )
  ])
]

#let exercise-card(ex) = [
  #let palette = exercise-palette-map.at(ex.type, default: default-exercise-palette)
  #let unit = ex.at("unit", default: "")
  #let distance-text = str(ex.distance) + if unit != "" { " " + unit } else { "" }
  #box(
    fill: palette.bg,
    stroke: (paint: palette.border, thickness: 0.9pt),
    radius: 10pt,
    inset: (x: 10pt, y: 8pt),
  )[
    #grid(columns: (auto, 1fr, auto), gutter: 8pt)[
      #dot(palette.border)
      #stack(spacing: 3pt)[
        #text(ex.description, weight: "semibold", fill: palette.text)
        #pill(
          ex.type,
          (bg: palette.bg, border: palette.border, text: palette.text),
        )
      ]
      #align(right + top)[
        #text(distance-text, weight: "bold", fill: palette.text)
      ]
    ]
  ]
]

#let section-card(section, accent) = box(
  stroke: (paint: rgb(226, 232, 240), thickness: 1pt),
  radius: 12pt,
  inset: 12pt,
  fill: white,
)[
  #let exercises = section.exercises
  #stack(spacing: 8pt, [
    #grid(columns: (auto, 1fr), gutter: 8pt)[
      #dot(accent.accent)
      #stack(spacing: 3pt)[
        #text(section.title, weight: "bold", size: 12pt, fill: accent.text)
        #if (section.at("comment", default: "") != "") [
          #text(section.comment, size: 10pt, fill: rgb(100, 116, 139), style: "italic")
        ]
      ]
    ]
    #stack(spacing: 6pt)[
      #for ex in exercises [ #exercise-card(ex) ]
    ]
  ])
]

#let total-banner(workout, accent) = box(
  fill: accent.accent,
  radius: 10pt,
  inset: 12pt,
)[
  #grid(columns: (1fr, auto), gutter: 6pt)[
    #stack(spacing: 2pt)[
      #set text(fill: white)
      #text("Distance totale", size: 10pt, weight: "medium")
      #text(str(workout.at("total-distance", default: 0)) + " m", size: 18pt, weight: "bold")
    ]
    #box(
      width: 30pt,
      height: 30pt,
      radius: 16pt,
      fill: white,
      stroke: (paint: accent.light, thickness: 0.8pt),
    )[ #align(center + horizon)[#text(water-icon, fill: accent.accent)] ]
  ]
]

#let footer-notes() = box(
  stroke: (paint: rgb(226, 232, 240), thickness: 0.8pt),
  radius: 10pt,
  inset: 10pt,
)[
  #stack(spacing: 8pt)[
    #grid(columns: (1fr, 1fr), gutter: 12pt)[
      #stack(spacing: 2pt)[
        #text("Temps total", size: 9pt, fill: rgb(107, 114, 128))
        #line(length: 100%, stroke: rgb(203, 213, 225))
      ]
      #stack(spacing: 2pt)[
        #text("Ressenti", size: 9pt, fill: rgb(107, 114, 128))
        #line(length: 100%, stroke: rgb(203, 213, 225))
      ]
    ]
    #stack(spacing: 2pt)[
      #text("Commentaires", size: 9pt, fill: rgb(107, 114, 128))
      #line(length: 100%, stroke: rgb(203, 213, 225))
    ]
  ]
]

#let render-workout(workout) = [
  #let default-type-accent = (accent: rgb(59, 130, 246), light: rgb(219, 234, 254), text: rgb(30, 64, 175))
  #let accent = type-colors.at(workout.type, default: default-type-accent)
  #let sections = array(workout.sections)
  #stack(spacing: 14pt)[
    #workout-header(workout, accent)
    #stack(spacing: 10pt)[
      #for section in sections [
        #section-card(section, accent)
      ]
    ]
    #total-banner(workout, accent)
    #footer-notes()
  ]
]

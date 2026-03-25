#set page(width: 210mm, height: 297mm, margin: 1.8cm)
#set text(font: "Noto Sans", size: 11pt, lang: "fr")

#let type-colors = (
  "Physique": (accent: rgb(249, 115, 22),  light: rgb(254, 237, 213)),
  "Endurance": (accent: rgb(59, 130, 246), light: rgb(219, 234, 254)),
  "Apnée": (accent: rgb(99, 102, 241),    light: rgb(229, 231, 246)),
  "Technique": (accent: rgb(168, 85, 247), light: rgb(243, 232, 255)),
  "Mixte": (accent: rgb(20, 184, 166),     light: rgb(209, 250, 229)),
  "Vitesse": (accent: rgb(239, 68, 68),    light: rgb(254, 226, 226)),
  "Récupération": (accent: rgb(34, 197, 94), light: rgb(220, 252, 231)),
)

#let exercise-colors = (
  "warmup": (bg: rgb(219, 234, 254), accent: rgb(59, 130, 246)),
  "arms": (bg: rgb(207, 250, 254), accent: rgb(8, 145, 178)),
  "legs": (bg: rgb(224, 231, 255), accent: rgb(79, 70, 229)),
  "fins": (bg: rgb(204, 251, 241), accent: rgb(16, 185, 129)),
  "intense": (bg: rgb(255, 237, 213), accent: rgb(249, 115, 22)),
  "recovery": (bg: rgb(220, 252, 231), accent: rgb(34, 197, 94)),
  "technical": (bg: rgb(237, 233, 254), accent: rgb(147, 51, 234)),
  "fullbody": (bg: rgb(224, 231, 255), accent: rgb(99, 102, 241)),
)

#let chip(label, accent) = box(
  inset: (x: 8pt, y: 4pt),
  radius: 8pt,
  fill: accent.light,
  stroke: (paint: accent.accent, thickness: 0.7pt),
)[
  #set text(size: 9pt, weight: "semibold", fill: accent.accent)
  #label
]

#let exercise-row(ex) = {
  #let palette = exercise-colors.at(ex.type, (bg: rgb(243, 244, 246), accent: rgb(59, 130, 246)))
  #box(
    fill: palette.bg,
    radius: 8pt,
    inset: (x: 10pt, y: 7pt),
    stroke: (paint: palette.accent, thickness: 0.7pt),
  )[
    #set text(size: 11pt)
    #stack(
      spacing: 4pt,
      [
        #text(ex.description, weight: "semibold", fill: rgb(31, 41, 55))
        #text(ex.distance, weight: "bold", fill: palette.accent)
        #text(ex.type, size: 9pt, fill: rgb(100, 116, 139))
      ],
    )
  ]
}

#let workout-summary(workout, accent) = box(
  fill: accent.accent,
  inset: 12pt,
  radius: 10pt,
)[
  #align(center + horizon)[
    #set text(fill: white)
    #text("Distance totale", size: 10pt, weight: "medium")
    #text(str(workout.total-distance) + " m", size: 18pt, weight: "bold")
  ]
]

#let section-block(section, accent) = box(
  stroke: (paint: rgb(226, 232, 240), thickness: 1pt),
  radius: 10pt,
  inset: 12pt,
  fill: white,
  shadow: (x: 0pt, y: 1pt, blur: 6pt, color: rgba(15, 23, 42, 10%)),
)[
  #stack(
    spacing: 8pt,
    [
      #grid(
        columns: (auto, 1fr),
        gutter: 6pt,
      )[
        #box(width: 10pt, height: 10pt, fill: accent.accent, radius: 10pt)
        #text(section.title, weight: "bold", fill: accent.accent, size: 12pt)
      ]
      #stack(spacing: 6pt)[
        #for ex in section.exercises { #exercise-row(ex) }
      ]
    ],
  )
]

#let render-workout(workout: dictionary) = {
  #let accent = type-colors.at(workout.type, (accent: rgb(59, 130, 246), light: rgb(219, 234, 254)))
  #stack(
    spacing: 14pt,
    [
      #box(
        fill: accent.light,
        inset: 14pt,
        radius: 12pt,
        stroke: (paint: accent.accent, thickness: 0.7pt),
      )[
        #stack(
          spacing: 6pt,
          [
            #text(workout.name, size: 20pt, weight: "bold", fill: accent.accent)
            #grid(columns: (auto, auto, 1fr), gutter: 8pt)[
              #chip(workout.type, accent)
              #if let date = workout.at("created-at", none); date != none && date != "" {
                #box(
                  inset: (x: 8pt, y: 4pt),
                  radius: 8pt,
                  fill: rgb(248, 250, 252),
                  stroke: (paint: rgb(203, 213, 225), thickness: 0.7pt),
                )[ #text("Créé le " + date, size: 9pt, fill: rgb(71, 85, 105)) ]
              }
              #box()
            ]
          ],
        )
      ]
      #stack(spacing: 10pt)[
        #for section in workout.sections {
          #section-block(section, accent)
        }
      ]
      #workout-summary(workout, accent)
    ],
  )
}

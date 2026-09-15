// ─────────────────────────────────────────────────────────────────────────────
// workout-template.typ  –  Fiche d'entraînement natation
// Rendu aligné sur SwimWorkoutSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────

#set page(width: 210mm, height: 297mm, margin: (x: 16mm, y: 15mm))
#set text(size: 11pt, lang: "fr")

// ── Palettes par type de workout ─────────────────────────────────────────────

#let type-colors = (
  "Physique":      (accent: rgb(249, 115, 22),  light: rgb(255, 237, 213), text: rgb(124, 45, 18)),
  "Endurance":     (accent: rgb(59, 130, 246),  light: rgb(219, 234, 254), text: rgb(30, 64, 175)),
  "Apnée":         (accent: rgb(99, 102, 241),  light: rgb(224, 231, 255), text: rgb(55, 48, 163)),
  "Technique":     (accent: rgb(168, 85, 247),  light: rgb(243, 232, 255), text: rgb(107, 33, 168)),
  "Mixte":         (accent: rgb(20, 184, 166),  light: rgb(204, 251, 241), text: rgb(13, 148, 136)),
  "Vitesse":       (accent: rgb(239, 68, 68),   light: rgb(254, 226, 226), text: rgb(153, 27, 27)),
  "Récupération":  (accent: rgb(34, 197, 94),   light: rgb(220, 252, 231), text: rgb(22, 101, 52)),
)

// Palettes par type d'exercice (alignées sur SwimWorkoutSheet getExerciseColor)
#let exercise-palette-map = (
  "warmup":    (bg: rgb(219, 234, 254), border: rgb(147, 197, 253), icon-bg: rgb(37, 99, 235),  text: rgb(17, 24, 39)),
  "arms":      (bg: rgb(207, 250, 254), border: rgb(103, 232, 249), icon-bg: rgb(8, 145, 178),  text: rgb(17, 24, 39)),
  "legs":      (bg: rgb(224, 242, 254), border: rgb(125, 211, 252), icon-bg: rgb(8, 145, 178),  text: rgb(17, 24, 39)),
  "fins":      (bg: rgb(204, 251, 241), border: rgb(94, 234, 212),  icon-bg: rgb(13, 148, 136), text: rgb(17, 24, 39)),
  "intense":   (bg: rgb(255, 237, 213), border: rgb(253, 186, 116), icon-bg: rgb(220, 38, 38),  text: rgb(127, 29, 29)),
  "recovery":  (bg: rgb(220, 252, 231), border: rgb(134, 239, 172), icon-bg: rgb(22, 163, 74),  text: rgb(20, 83, 45)),
  "technical": (bg: rgb(243, 232, 255), border: rgb(216, 180, 254), icon-bg: rgb(147, 51, 234), text: rgb(17, 24, 39)),
  "fullbody":  (bg: rgb(224, 231, 255), border: rgb(165, 180, 252), icon-bg: rgb(67, 56, 202),  text: rgb(17, 24, 39)),
)

#let default-exercise-palette = (
  bg: rgb(241, 245, 249), border: rgb(203, 213, 225), icon-bg: rgb(8, 145, 178), text: rgb(51, 65, 85)
)

// Labels français pour les types d'exercice
#let exercise-type-labels = (
  "warmup": "Échauffement",
  "arms": "Bras",
  "legs": "Jambes",
  "fins": "Palmes",
  "intense": "Intensité",
  "recovery": "Récupération",
  "technical": "Technique",
  "fullbody": "Complet",
)

// ── En-tête du workout ────────────────────────────────────────────────────────
// Reproduit le header de SwimWorkoutSheet :
//   icône ronde bleue │ titre + date │ bandeau objectif

#let workout-header(workout, accent) = block(
  breakable: false,
  width: 100%,
  inset: 0pt,
)[
  // Ligne titre : icône + nom + date
  #grid(columns: (auto, 1fr), column-gutter: 10pt, align: (center + horizon, left))[
    #box(
      width: 36pt, height: 36pt, radius: 18pt,
      fill: accent.accent,
    )[
      #align(center + horizon)[
        #text("~", size: 16pt, fill: white, weight: "bold")
      ]
    ]
  ][
    #text(workout.name, size: 18pt, weight: "bold", fill: rgb(17, 24, 39))
    #linebreak()
    #let date = workout.at("created-at", default: none)
    #if date != none and date != "" [
      #text(date, size: 11pt, fill: rgb(75, 85, 99))
    ]
  ]

  #v(8pt)

  // Bandeau objectif (type du workout)
  #block(
    width: 100%,
    fill: rgb(239, 246, 255),
    stroke: (left: 3pt + accent.accent),
    inset: (x: 10pt, y: 8pt),
    radius: (right: 4pt),
  )[
    #text("Objectif : ", weight: "bold", size: 10pt, fill: rgb(55, 65, 81))
    #text(workout.type, size: 10pt, fill: rgb(107, 114, 128), style: "italic")
  ]
]

// ── Carte exercice ────────────────────────────────────────────────────────────
// Reproduit chaque ligne d'exercice de SwimWorkoutSheet :
//   [icône colorée] description / distance (type)  │  distance à droite

#let exercise-card(ex) = {
  let palette = exercise-palette-map.at(ex.type, default: default-exercise-palette)
  let unit = ex.at("unit", default: "")
  let distance-text = str(ex.distance) + if unit != "" { " " + unit } else { "" }
  let type-label = exercise-type-labels.at(ex.type, default: ex.type)
  let is-recovery = ex.type == "recovery"

  block(
    breakable: false,
    width: 100%,
    fill: palette.bg,
    stroke: (paint: palette.border, thickness: 1.5pt),
    radius: 10pt,
    inset: if is-recovery { (x: 10pt, y: 5pt) } else { (x: 10pt, y: 8pt) },
  )[
    #grid(columns: (auto, 1fr, auto), column-gutter: 8pt, align: (center + horizon, left + horizon, right + horizon))[
      // Icône ronde colorée
      #box(
        width: 22pt, height: 22pt, radius: 6pt,
        fill: palette.icon-bg,
      )[
        #align(center + horizon)[
          #text("•", size: 10pt, fill: white, weight: "bold")
        ]
      ]
    ][
      // Description + type
      #text(ex.description, weight: "bold", size: 11pt, fill: palette.text)
      #linebreak()
      #text(type-label, size: 9pt, fill: rgb(75, 85, 99), weight: "bold")
    ][
      // Distance
      #text(distance-text, weight: "bold", size: 11pt, fill: palette.text)
    ]
  ]
}

// ── Carte section ─────────────────────────────────────────────────────────────
// Reproduit les sections de SwimWorkoutSheet :
//   barre bleue │ TITRE MAJUSCULES │ ligne
//   commentaire en italique
//   exercices

#let section-card(section, accent) = block(
  breakable: false,
  width: 100%,
  inset: 0pt,
)[
  // Titre section avec barres
  #grid(columns: (auto, auto, 1fr), column-gutter: 6pt, align: (center + horizon, left + horizon, center + horizon))[
    #box(width: 20pt, height: 3pt, radius: 2pt, fill: accent.accent)
  ][
    #text(
      upper(section.title),
      weight: "bold",
      size: 11pt,
      fill: accent.text,
    )
  ][
    #box(width: 100%, height: 3pt, radius: 2pt, fill: rgb(191, 219, 254))
  ]

  // Commentaire
  #if section.at("comment", default: "") != "" [
    #v(3pt)
    #text(section.comment, size: 9pt, fill: rgb(75, 85, 99), style: "italic")
  ]

  #v(6pt)

  // Exercices
  #stack(spacing: 5pt)[
    #for ex in section.exercises [
      #exercise-card(ex)
    ]
  ]
]

// ── Bandeau distance totale ───────────────────────────────────────────────────
// Gradient bleu → cyan dans React, on utilise l'accent du type

#let total-banner(workout, accent) = block(
  breakable: false,
  width: 100%,
  fill: accent.accent,
  radius: 10pt,
  inset: (x: 14pt, y: 12pt),
)[
  #grid(columns: (1fr, auto), column-gutter: 6pt, align: (left + horizon, right + horizon))[
    #stack(spacing: 2pt)[
      #text("Distance totale", size: 10pt, fill: white.transparentize(20%))
      #text(str(workout.at("total-distance", default: 0)) + "m", size: 22pt, weight: "bold", fill: white)
    ]
  ][
    // Icône vague stylisée
    #box(
      width: 32pt, height: 32pt, radius: 16pt,
    )[
      #align(center + horizon)[
        #text("~", size: 24pt, fill: white.transparentize(50%))
      ]
    ]
  ]
]

// ── Notes de fin de séance ────────────────────────────────────────────────────

#let footer-notes() = block(
  breakable: false,
  width: 100%,
  inset: 0pt,
)[
  #line(length: 100%, stroke: 1.5pt + rgb(229, 231, 235))
  #v(10pt)
  #grid(columns: (1fr, 1fr), column-gutter: 14pt)[
    #stack(spacing: 4pt)[
      #text("Temps total", size: 9pt, fill: rgb(107, 114, 128), weight: "bold")
      #line(length: 100%, stroke: 0.5pt + rgb(209, 213, 219))
    ]
  ][
    #stack(spacing: 4pt)[
      #text("Ressenti", size: 9pt, fill: rgb(107, 114, 128), weight: "bold")
      #line(length: 100%, stroke: 0.5pt + rgb(209, 213, 219))
    ]
  ]
  #v(6pt)
  #stack(spacing: 4pt)[
    #text("Commentaires", size: 9pt, fill: rgb(107, 114, 128), weight: "bold")
    #line(length: 100%, stroke: 0.5pt + rgb(209, 213, 219))
  ]
]

// ── Rappel hydratation ────────────────────────────────────────────────────────

#let hydration-reminder() = block(
  breakable: false,
  width: 100%,
  fill: rgb(239, 246, 255),
  radius: 8pt,
  inset: (x: 12pt, y: 8pt),
)[
  #text("💧 N'oublie pas de t'hydrater !", size: 10pt, fill: rgb(30, 64, 175), weight: "medium")
]

// ── Rendu principal ───────────────────────────────────────────────────────────

#let render-workout(workout) = {
  let default-accent = (accent: rgb(59, 130, 246), light: rgb(219, 234, 254), text: rgb(30, 64, 175))
  let accent = type-colors.at(workout.type, default: default-accent)
  let sections = array(workout.sections)

  block(breakable: true, width: 100%)[
    #stack(spacing: 16pt)[
      #workout-header(workout, accent)
      #stack(spacing: 14pt)[
        #for section in sections [
          #section-card(section, accent)
        ]
      ]
      #total-banner(workout, accent)
      #footer-notes()
      #hydration-reminder()
    ]
  ]
}

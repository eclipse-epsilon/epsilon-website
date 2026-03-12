#!/usr/bin/env bash

# Endpoint used by the Epsilon Playground visualisation service
PLAYGROUND_URL="https://uk-ac-york-cs-epsilon-playground.h5rwqzvxy5sr4.eu-west-1.cs.amazonlightsail.com/flexmi2plantuml"

# ------------------------------------------------------------
# generate_diagram <flexmi_file> <emfatic_file> <output_svg>
# ------------------------------------------------------------
generate_diagram() {
  local FLEXMI_FILE="$1"
  local EMFATIC_FILE="$2"
  local OUTPUT_FILE="$3"

  echo "Generating diagram from:"
  echo "  Flexmi:   $FLEXMI_FILE"
  echo "  Emfatic:  $EMFATIC_FILE"
  echo "  Output:   $OUTPUT_FILE"

  curl -sS -X POST \
    "$PLAYGROUND_URL" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
          --arg flexmi  "$(cat "$FLEXMI_FILE")" \
          --arg emfatic "$(cat "$EMFATIC_FILE")" \
          '{flexmi:$flexmi, emfatic:$emfatic}')" \
  | jq -r '.modelDiagram' > "$OUTPUT_FILE"

  echo "Diagram saved to $OUTPUT_FILE"
  echo
}

generate_diagram \
  "../../../../playground/examples/psl.flexmi" \
  "../../../../playground/examples/psl.emf" \
  "psl.svg"

generate_diagram \
  "../../../../playground/examples/ccl/ccl.flexmi" \
  "../../../../playground/examples/ccl/ccl.emf" \
  "ccl.svg"

generate_diagram \
  "../../../../playground/examples/stm.flexmi" \
  "../../../../playground/examples/stm.emf" \
  "stm.svg"

generate_diagram \
  "../../../../playground/examples/callcentre/callcentre.flexmi" \
  "../../../../playground/examples/callcentre/callcentre.emf" \
  "callcentre.svg"
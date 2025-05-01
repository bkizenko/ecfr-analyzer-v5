#!/bin/bash

token=""

slugs=(
  "agriculture-department"
  "environmental-protection-agency"
  "treasury-department"
  "trade-representative-office-of-united-states"
  "utah-reclamation-mitigation-and-conservation-commission"
  "veterans-affairs-department"
  "office-of-vice-president-of-the-united-states"
  "water-resources-council"
  "president's-commission-on-white-house-fellowships"
)

for slug in "${slugs[@]}"; do
  echo "Sending request for ${slug}"

  curl -X POST \
       -H "Authorization: Bearer ${token}" \
       "https://ecfr-server-693619510334.us-central1.run.app/ecfr-service/compute/agency-metrics?agencies=${slug}" &
done

wait
echo "All requests have been sent."


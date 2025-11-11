#!/usr/bin/env pwsh
# Set FROM_EMAIL secret for SendGrid

$email = "noreply@em9665.play-sport.pro"
$email | firebase functions:secrets:set FROM_EMAIL

$cred = Get-StoredCredential -Target "git:https://github.com"
if ($cred) {
    $pat = $cred.GetNetworkCredential().Password
    $body = '{"name":"flowly-ai","public":true}'
    $headers = @{"Authorization"="token $pat"; "Accept"="application/vnd.github.v3+json"}
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
}

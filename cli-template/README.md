# ntuaf 管理 CLI

## env

確保 node 環境 >= v18
`node --version`

請安裝相依
`npm i -g @funboxteam/optimizt`

請安裝 firebase admin 金鑰
`key.json`

## 單日維護行為

```
# please use `globalInstall` first
ntuaf -m backup
ntuaf -m updateUserData
ntuaf -m refreshCache
```

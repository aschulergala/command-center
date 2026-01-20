## GalaChain Command Center (dApp) — Bare-bones PRD

### Purpose

A lightweight wallet-facing dApp that exposes a small set of GalaChain actions:

* Fungible token balances + allowances
* Transfer / Mint / Burn for fungible tokens (when allowed)
* NFTs: view + filter by collection
* Transfer / Mint / Burn for NFTs (when allowed)
* Creators: Pump interface entry + NFT collection tooling
* Export wallet activity (paid) as a well-formatted CSV

---

## Pages / Sections

### 1) Fungible Tokens

**Features**

* List fungible tokens for the connected wallet
* Show balances
* Show allowances / approvals
* Sort tokens (basic)
* Actions:

  * Transfer
  * Mint (if authorized)
  * Burn (if authorized)

**Data shown (minimum)**

* Token name / symbol
* Balance
* Allowances: spender + approved amount

---

### 2) NFTs

**Features**

* List NFTs owned by the connected wallet
* Sort NFTs (basic)
* Filter NFTs by Collection
* Actions:

  * Transfer
  * Mint (if authorized)
  * Burn (if authorized)

**Data shown (minimum)**

* NFT identifier (collection + token id)
* Optional: name/image if available

---

### 3) Creators

**Features**

* Pump interface (entry point)
* NFT collection tools:

  * Create/claim a collection
  * Create/manage classes (if applicable)
  * Mint from a collection/class (if authorized)

**Data shown (minimum)**

* Collections you control
* Classes under a collection (if applicable)

---

### 4) Export Wallet Activity (coming soon, not for MVP)

**Features**

* User requests export for a wallet (connected wallet by default)
* Export is **paid**
* Export takes time (async)
* User receives a **well-formatted CSV**
* Export may include searching blocks/transactions via backend API

**Inputs (minimum)**

* Wallet address
* Date range (or “all time”)
* Optional toggles: FT events, NFT events, allowance events

**Output (minimum CSV columns)**

* timestamp
* event_type (transfer/mint/burn/allowance)
* asset (token symbol or collection/token id)
* from
* to
* amount (blank for NFTs)
* tx/reference id

---

## Global requirements (minimal)

* Works with a connected wallet (web3 or custodial session)
* Basic navigation between sections
* Actions appear only when allowed for the current wallet/context
* No requirement for pricing/portfolio valuation, marketplace, or swapping

---

## MVP scope checklist

* [ ] FT balances + allowances
* [ ] FT transfer/mint/burn (mint/burn gated by authorization)
* [ ] NFT list + filter by collection
* [ ] NFT transfer/mint/burn (mint/burn gated by authorization)
* [ ] Creators: Pump entry + NFT collection tooling
* [ ] Paid async export that produces a clean CSV (coming soon)

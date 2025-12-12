# Sample CSV Output Files

## Accounts CSV Sample
```csv
Display name,Net liquidation,Trailing max drawdown
PAAPEX3982600000022,52500.00,1500.00
PAAPEX3982600000021,51000.00,1500.00
PAAPEX3982600000016,50250.00,1500.00
PAAPEX3982600000015,49800.00,1500.00
PAAPEX3982600000012,49500.00,1500.00
```

**Notes:**
- `Display name`: Exact account display name from NinjaTrader
- `Net liquidation`: Account net liquidation value (rounded down to 2 decimals)
- `Trailing max drawdown`: User-entered value (rounded down to 2 decimals)

## Strategies CSV Sample
```csv
Strategy,Instrument,Account display name
Grass Fed Prime Beef 2.0,NQ,PAAPEX3982600000022
Grass Fed Prime Beef 2.0,NQ,PAAPEX3982600000021
PrimeBeef,MNQ,PAAPEX3982600000016
BeefBowl,NQ,PAAPEX3982600000015
Meat Popsicle,MNQ,PAAPEX3982600000012
```

**Notes:**
- `Strategy`: Strategy name as entered by user
- `Instrument`: Normalized to "NQ" or "MNQ" (case-insensitive matching)
- `Account display name`: Must exactly match a `Display name` from the Accounts CSV

## Important Matching Rules
1. The `Account display name` in Strategies CSV must exactly match `Display name` in Accounts CSV
2. Instrument values are normalized:
   - "NQ 12-25" → "NQ"
   - "MNQ 12-25" → "MNQ"
   - "NQ" → "NQ"
   - "MNQ" → "MNQ"
3. All numeric values are rounded down to 2 decimal places using `Math.Floor(value * 100) / 100`


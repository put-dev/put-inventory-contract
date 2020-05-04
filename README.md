# put-eosio-contract
Smart contract deployable to EOS and EOSIO chains.


## Table Structure: `keyval`

| id | owner (account) | key (string)   | value (string)      |
|----|-----------------|----------------|---------------------|
| 1  | dataproofeos    | max_signups    | 100                 |
| 2  | dataproofeos    | signup_uri     | https://example.tld |
| 3  | anotheracct     | encrypted_hash | 4db268bbaad225a0a   |

## API
**insert(account owner, string key, string value)**
- Inserts a new entry into `keyval` with corresponding account, key, and value. 
- There can be keys of same value (so long as they are not from the same account). 
- Authorized account owner calls insert (ie: `anotheracct` can only add keys for himself).
- Contract owner *can* call insert with any account owner.
- Caller pays for data storage.

**update(account owner, string key, string value)**
- Updates existing into `keyval` with corresponding account, key, and value. 
- Authorized account owner calls update (ie: `anotheracct` can only add keys for himself).
- Contract owner *cannot* call update with any account owner.

**rekey(account owner, string key, string new_key)**
- Changes the key string for an existing key.
- Authorized account owner calls rekey (ie: `anotheracct` can only rekey keys for himself).
- Fails if `key` not found.

**delete(account owner, string key)**
- Deletes entry in `keyval` matching account and key.
- Authorized account owner calls delete (ie: `anotheracct` can only delete keys for himself).
- Contract owner *cannot* call delete with any account owner.


## TBD
- what is the maximum string size? length ( should be enforced by libs )
- does key column need to be optimized? 

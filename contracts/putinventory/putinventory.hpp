#pragma once

#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <eosio/eosio.hpp>
#include <eosio/crypto.hpp>
#include <string>
#include <vector>

using namespace std;
using namespace eosio;

CONTRACT putinventory: public contract {
    public:
        using contract::contract;

        putinventory(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds) {
        }

        ACTION insertkey(const name& owner, const uint16_t& bin_id, const string& key, const string& value);
        ACTION updatekey(const name& owner, const uint16_t& bin_id, const string& key, const string& value);
        ACTION rekey    (const name& owner, const uint16_t& bin_id, const string& key, const string& new_key);
        ACTION deletekey(const name& owner, const uint16_t& bin_id, const string& key);

        TABLE keyval {
            uint64_t  id;
            uint16_t  bin_id;
            string    key;
            string    value;

            uint64_t primary_key()const { return id; }
            checksum256 get_checksum256_key()const {
                return putinventory::get_checksum256_key(to_string(bin_id) + "-" + key);
            }
        };

        typedef eosio::multi_index<"keyval"_n, keyval, 
            indexed_by<"bycatkey"_n, const_mem_fun<keyval, checksum256, &keyval::get_checksum256_key>>
        > keyvals;

    private:
        static checksum256 get_checksum256_key(const string& key) {
            return sha256(key.c_str(), key.size());
        }
};

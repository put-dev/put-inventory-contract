#pragma once

#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <eosio/eosio.hpp>
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

        ACTION insertkey(const name& owner, const string& key, const string& value);
        ACTION updatekey(const name& owner, const string& key, const string& value);
        ACTION rekey(const name& owner, const string& key, const string& new_key);
        ACTION deletekey(const name& owner, const string& key);

        TABLE keyval {
            string    key;
            string    value;

            string primary_key()const { return key; }
        };

        typedef eosio::multi_index< "keyval"_n, keyval > keyvals;

      private:
      
};

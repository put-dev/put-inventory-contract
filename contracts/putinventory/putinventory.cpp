#include "putinventory.hpp"

ACTION putinventory::insertkey(const name& owner, const uint16_t& bin_id, const string& key, const string& value)
{
    require_auth( has_auth(owner) ? owner : _self );
    keyvals keyvalstable(_self, owner.value);
    const auto& keyvals_index = keyvalstable.get_index<name("bycatkey")>();
    const auto& keyval_itr = keyvals_index.find( putinventory::get_checksum256_key(to_string(bin_id) + "-" + key) );
    check(keyval_itr == keyvals_index.end(), "cannot insert already existing key");
    keyvalstable.emplace(owner, [&]( auto& d ) {
        d.id = keyvalstable.available_primary_key();
        d.bin_id = bin_id;
        d.key = key;
        d.value = value;
    });
}

ACTION putinventory::updatekey(const name& owner, const uint16_t& bin_id, const string& key, const string& value)
{
    require_auth( owner );
    keyvals keyvalstable(_self, owner.value);
    const auto& keyvals_index = keyvalstable.get_index<name("bycatkey")>();
    const auto& keyval = keyvals_index.get( putinventory::get_checksum256_key(to_string(bin_id) + "-" + key), "key not found" );
    keyvalstable.modify(keyval, owner, [&]( auto& d ) {
        d.value = value;
    });
}

ACTION putinventory::rekey(const name& owner, const uint16_t& bin_id, const string& key, const string& new_key)
{
    require_auth( owner );
    check(key != new_key, "cannot rekey to same key");

    const auto& cat_str = to_string(bin_id);
    keyvals keyvalstable(_self, owner.value);
    const auto& keyvals_index = keyvalstable.get_index<name("bycatkey")>();
    const auto& keyval = keyvals_index.get( putinventory::get_checksum256_key(cat_str + "-" + key), "key not found" );
    const auto& keyval_new_itr = keyvals_index.find( putinventory::get_checksum256_key(cat_str + "-" + new_key) );
    check(keyval_new_itr == keyvals_index.end(), "cannot rekey to a already existing key");
    keyvalstable.modify(keyval, owner, [&]( auto& d ) {
        d.key = new_key;
    });
}

ACTION putinventory::deletekey(const name& owner, const uint16_t& bin_id, const string& key)
{
    require_auth( owner );
    keyvals keyvalstable(_self, owner.value);
    const auto& keyvals_index = keyvalstable.get_index<name("bycatkey")>();
    const auto& keyval = keyvals_index.get( putinventory::get_checksum256_key(to_string(bin_id) + "-" + key), "key not found" );
    keyvalstable.erase(keyval);
}

extern "C" {
    void apply (uint64_t receiver, uint64_t code, uint64_t action ) {
        auto self = receiver;

        if ( code == self ) {
            switch( action ) {
                EOSIO_DISPATCH_HELPER( putinventory, (insertkey) (updatekey) (rekey) (deletekey) )
            }
        }
    }
}

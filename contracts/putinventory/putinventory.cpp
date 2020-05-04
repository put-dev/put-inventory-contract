#include "putinventory.hpp"

ACTION putinventory::insertkey(const name& owner, const string& key, const string& value)
{

}

ACTION putinventory::updatekey(const name& owner, const string& key, const string& value)
{
    require_auth( owner );

}

ACTION putinventory::rekey(const name& owner, const string& key, const string& new_key)
{
    require_auth( owner );
}

ACTION putinventory::deletekey(const name& owner, const string& key)
{
    require_auth( owner );
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

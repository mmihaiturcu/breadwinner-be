module default {
    
    type APIKey {
        required property prefix -> str;
        required property hash -> str;
        required property hostname -> str;

        required link dataProcessor -> DataProcessor {
            on target delete delete source;
        }
    }

    type Confirmation {
        required property uuid -> str;
        required property wasUsed -> bool;
        required property expiresAt -> datetime;
    }

    scalar type Role extending enum<DATA_SUPPLIER, DATA_PROCESSOR>;

    type User {
        required property email -> str {
            constraint exclusive;
        }
        property password -> str;
        required property role -> Role;
        property otpSecret -> str;
        
        link confirmation -> Confirmation;
    }

    type Chunk {
        required property length -> int16;
        required property processed -> bool;
        required property paidFor -> bool;

        link payload := .<chunks[is Payload];   

        link dataProcessor -> DataProcessor;
    }

    
    # Dataset which a DataSupplier uploads, which is to be processed in a specific way as indicated by its associated JSONSchema.
    # It is formed of multiple (encrypted) chunks, each containing a set amount of data (details such as number of rows in each Chunk, operations etc. are stored in JSONSchema).
    type Payload {
        required property label -> str;
        property hasGaloisKeys -> bool;
        property hasRelinKeys -> bool;
        required property jsonSchema -> json;

        required link dataSupplier -> DataSupplier {
            on target delete delete source;
        }
        link payment -> Payment {
            on target delete delete source;
        };
        multi link chunks -> Chunk {
            constraint exclusive;
        }
    }

    scalar type PaymentState extending enum<PENDING, PAID>;

    type Payment {
        required property stripeSessionID -> str;
        required property stripeCheckoutURL -> str;
        required property paymentState -> PaymentState;
        required property createdAt -> datetime;

        multi link payloads := .<payment[is Payload];

        required link dataSupplier -> DataSupplier {
            on target delete delete source;
        }
    }

    type DataProcessor {
        required property activatedStripeAccount -> bool;
        property connectedStripeAccountID -> str;
        link userDetails -> User {
            on target delete delete source;
        }
        multi link chunks := .<dataProcessor[is Chunk];
        link payable_chunks := (
            select .chunks filter .paidFor = false
        )
    }

    type DataSupplier {
        link userDetails -> User {
            on target delete delete source;
        }
        multi link payloads := .<dataSupplier[is Payload]
    }
}

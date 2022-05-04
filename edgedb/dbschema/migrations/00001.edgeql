CREATE MIGRATION m1lx77h3qzm2zf64wav2fztmhpwx3e6bclkj5feqs526jypzay2adq
    ONTO initial
{
  CREATE TYPE default::APIKey {
      CREATE REQUIRED PROPERTY hash -> std::str;
      CREATE REQUIRED PROPERTY hostname -> std::str;
      CREATE REQUIRED PROPERTY prefix -> std::str;
  };
  CREATE TYPE default::Confirmation {
      CREATE REQUIRED PROPERTY expiresAt -> std::datetime;
      CREATE REQUIRED PROPERTY uuid -> std::str;
      CREATE REQUIRED PROPERTY wasUsed -> std::bool;
  };
  CREATE SCALAR TYPE default::Role EXTENDING enum<DATA_SUPPLIER, DATA_PROCESSOR>;
  CREATE TYPE default::User {
      CREATE LINK confirmation -> default::Confirmation;
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY otpSecret -> std::str;
      CREATE PROPERTY password -> std::str;
      CREATE REQUIRED PROPERTY role -> default::Role;
  };
  CREATE TYPE default::DataProcessor {
      CREATE LINK userDetails -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY activatedStripeAccount -> std::bool;
      CREATE PROPERTY connectedStripeAccountID -> std::str;
  };
  ALTER TYPE default::APIKey {
      CREATE REQUIRED LINK dataProcessor -> default::DataProcessor {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  CREATE TYPE default::Chunk {
      CREATE LINK dataProcessor -> default::DataProcessor;
      CREATE REQUIRED PROPERTY paidFor -> std::bool;
      CREATE REQUIRED PROPERTY length -> std::int16;
      CREATE REQUIRED PROPERTY processed -> std::bool;
  };
  ALTER TYPE default::DataProcessor {
      CREATE MULTI LINK chunks := (.<dataProcessor[IS default::Chunk]);
      CREATE LINK payable_chunks := (SELECT
          .chunks
      FILTER
          (.paidFor = false)
      );
  };
  CREATE TYPE default::Payload {
      CREATE MULTI LINK chunks -> default::Chunk {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY hasGaloisKeys -> std::bool;
      CREATE PROPERTY hasRelinKeys -> std::bool;
      CREATE REQUIRED PROPERTY jsonSchema -> std::json;
      CREATE REQUIRED PROPERTY label -> std::str;
  };
  ALTER TYPE default::Chunk {
      CREATE LINK payload := (.<chunks[IS default::Payload]);
  };
  CREATE TYPE default::DataSupplier {
      CREATE LINK userDetails -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  ALTER TYPE default::Payload {
      CREATE REQUIRED LINK dataSupplier -> default::DataSupplier {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  ALTER TYPE default::DataSupplier {
      CREATE MULTI LINK payloads := (.<dataSupplier[IS default::Payload]);
  };
  CREATE SCALAR TYPE default::PaymentState EXTENDING enum<PENDING, PAID>;
  CREATE TYPE default::Payment {
      CREATE REQUIRED LINK dataSupplier -> default::DataSupplier {
          ON TARGET DELETE  DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY createdAt -> std::datetime;
      CREATE REQUIRED PROPERTY paymentState -> default::PaymentState;
      CREATE REQUIRED PROPERTY stripeCheckoutURL -> std::str;
      CREATE REQUIRED PROPERTY stripeSessionID -> std::str;
  };
  ALTER TYPE default::Payload {
      CREATE LINK payment -> default::Payment {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  ALTER TYPE default::Payment {
      CREATE MULTI LINK payloads := (.<payment[IS default::Payload]);
  };
};

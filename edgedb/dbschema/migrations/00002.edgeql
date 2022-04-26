CREATE MIGRATION m1pywrqtqlqb6ed7ufuczafqvoujtiokrbzjvciwytc7zhxurmanjq
    ONTO m1kk43ashwjkhavo24a2pcpy2emntjlgcykv66irsbtcq7xbrtqhca
{
  ALTER TYPE default::User {
      DROP PROPERTY salt;
  };
};

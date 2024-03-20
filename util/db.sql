CREATE EXTENSION IF NOT EXISTs "uuid-ossp";

CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_fname TEXT NOT NULL,
    user_lname TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    user_password TEXT NOT NULL,
    user_profile TEXT
);

CREATE TABLE companies(
    company_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL UNIQUE,
    company_image_url TEXT

);

CREATE TABLE user_agencies(
    agency_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL, 
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id),
    CONSTRAINT fk_company FOREIGN KEY(company_id) REFERENCES companies(company_id)
);

CREATE TABLE transactions(
    transaction_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    transaction_amont BIGINT NOT NULL,
    agency_id uuid NOT NULL,
    CONSTRAINT fk_agency FOREIGN KEY(agency_id) REFERENCES user_agencies(agency_id)
);

CREATE TABLE float_balances(
    floatbalance_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid NOT NULL,
    daya_date DATE NOT NULL,
    opening_float BIGINT NOT NULL,
    closing_float BIGINT NOT NULL,
    CONSTRAINT fk_agency FOREIGN KEY(agency_id) REFERENCES user_agencies(agency_id)
);

CREATE TABLE cash_balances(
    cashbalance_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    day_date DATE NOT NULL,
    opening_cash BIGINT NOT NULL,
    closing_cash BIGINT NOT NULL,
    CONSTRAINT fk_users FOREIGN KEY(user_id) REFERENCES users(user_id)
);

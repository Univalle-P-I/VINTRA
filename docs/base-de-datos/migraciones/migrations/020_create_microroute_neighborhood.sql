BEGIN;

CREATE TABLE microroute_neighborhood (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL,
    microroute_id UUID NOT NULL,
    order_visit INT NOT NULL,
    CONSTRAINT fk_microroute_neighborhood_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES btura_neighborhood (id),
    CONSTRAINT fk_microroute_neighborhood_microroute FOREIGN KEY (microroute_id) REFERENCES microroute (id),
    CONSTRAINT uq_microroute_neighborhood UNIQUE (microroute_id, neighborhood_id),
    CONSTRAINT uq_microroute_neighborhood_order UNIQUE (microroute_id, order_visit),
    CONSTRAINT ck_microroute_neighborhood_order_visit CHECK (order_visit > 0)
);

CREATE INDEX idx_microroute_neighborhood_neighborhood_id ON microroute_neighborhood (neighborhood_id);
CREATE INDEX idx_microroute_neighborhood_microroute_id ON microroute_neighborhood (microroute_id);

COMMIT;

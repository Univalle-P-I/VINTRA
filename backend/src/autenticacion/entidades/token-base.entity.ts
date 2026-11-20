import { Column } from 'typeorm';

export abstract class TokenBase {
  @Column({
    name: 'token_hash',
    type: 'char',
    length: 64,
  })
  hashToken: string;

  @Column({
    name: 'request_ip',
    type: 'inet',
    nullable: true,
  })
  ipSolicitud: string | null;

  @Column({
    name: 'used_at',
    type: 'timestamptz',
    nullable: true,
  })
  utilizadoEn: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiraEn: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}

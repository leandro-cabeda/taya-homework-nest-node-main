import { ApiTags, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ProposalStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  REFUSED = 'REFUSED',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

@Entity({ name: 'users' })
@ApiTags('users')
export class User {

  @ApiProperty({
    example: 1,
    description: 'Identificador do usuário',
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Customer, (customer) => customer.userCreator)
  createdCustomers: Customer[];

  @OneToMany(() => Proposal, (proposal) => proposal.userCreator)
  proposals: Proposal[];

  @ApiProperty({
    example: 'Joaquim',
    description: 'Nome do usuário',
    type: String,
  })
  @Column({ nullable: false, type: 'varchar', length: 200 })
  name: string;


  @ApiProperty({
    example: 0,
    description: 'Saldo do usuário',
    type: Number,
  })
  @Column({ nullable: false, type: 'decimal', default: 0 })
  balance: number;


  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de criação do usuário',
    type: Date,
  })
  email: string;
  @Column({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de atualização do usuário',
    type: Date,
  })
  @Column({ type: 'datetime' })
  updatedAt: Date;
}

@Entity({ name: 'customers' })
@ApiTags('customer')
export class Customer {

  @ApiProperty({
    example: 1,
    description: 'Identificador do cliente',
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.proposals)
  userCreator: User;

  @OneToMany(() => Proposal, (proposal) => proposal.customer)
  proposals: Proposal[];

  @ApiProperty({
    example: 'Joaquim',
    description: 'Nome do cliente',
    type: String,
  })
  @Column({ nullable: false, type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({
    example: '000.000.000-00',
    description: 'CPF do cliente',
    type: String,
  })
  @Column({ nullable: false, type: 'varchar', length: 200 })
  cpf: string;

  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de criação do cliente',
    type: Date,
  })
  email: string;
  @Column({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de atualização do cliente',
    type: Date,
  })
  @Column({ type: 'datetime' })
  updatedAt: Date;
}

@Entity({ name: 'proposals' })
@ApiTags('proposal')
export class Proposal {

  @ApiProperty({
    example: 1,
    description: 'Identificador da proposta',
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.proposals)
  userCreator: User;

  @ManyToOne(() => Customer, (customer) => customer.proposals)
  customer: Customer;

  @ApiProperty({
    example: 0,
    description: 'Lucro da proposta',
    type: Number,
  })
  @Column({ nullable: false, type: 'decimal', default: 0 })
  profit: number;

  @ApiProperty({
    example: 'PENDING',
    description: 'Status da proposta',
    type: String,
  })
  @Column({
    nullable: false,
    type: 'varchar',
    default: ProposalStatus.PENDING,
  })
  status: ProposalStatus;

  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de criação da proposta',
    type: Date,
  })
  email: string;
  @Column({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    example: '02/02/2022 12:00:00',
    description: 'Data de atualização da proposta',
    type: Date,
  })
  @Column({ type: 'datetime' })
  updatedAt: Date;
}

import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Proposal, ProposalStatus, User } from './entities/entities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserMiddleware } from './get-user-middleware';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Corrigir a API para retornar a proposta apenas se pertencer ao user que está chamando.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna proposta referente o usuario',
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @UseGuards(UserMiddleware)
  async getProposal(
    @Req() req: { user: User },
    @Param('id') id: number,
  ): Promise<Proposal> {
    const userId = req.user.id;

    try {
      const proposal = await this.proposalRepository.findOne({
        where: { id, userCreator: { id: userId } },
        relations: ['user'],
      });

      if (!proposal)
        throw new NotFoundException(
          `Proposta com ID ${id} não encontrada para o usuário id ${userId}`,
        );

      return proposal;
    } catch (error: any) {
      console.error(error);

      if (error.status === 404)
        throw new NotFoundException(error.message, error);
      else
        throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna lista de propostas pendentes de um user..',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista de propostas pendentes',
  })
  @UseGuards(UserMiddleware)
  async getPendingProposalsByUserId(
    @Req() req: { user: User },
  ): Promise<Proposal[]> {
    const userId = req.user.id;
    try {
      return this.proposalRepository.find({
        where: { userCreator: { id: userId }, status: ProposalStatus.PENDING },
        relations: ['user'],
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Get('refused')
  @ApiOperation({ summary: 'Retorna propostas rejeitadas criadas por um user' })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista de propostas rejeitadas',
  })
  @UseGuards(UserMiddleware)
  async getRefusedProposalsByUserId(
    @Req() req: { user: User },
  ): Promise<Proposal[]> {
    const userId = req.user.id;
    try {
      return this.proposalRepository.find({
        where: { userCreator: { id: userId }, status: ProposalStatus.REFUSED },
        relations: ['user'],
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Post(':proposal_id/approve')
  @ApiOperation({ summary: 'Retorna a proposta atualizada pelo user' })
  @ApiResponse({ status: 200, description: 'Retorna a proposta atualizada' })
  @ApiParam({ name: 'proposal_id', required: true, type: Number })
  @UseGuards(UserMiddleware)
  async approveProposal(
    @Req() req: { user: User },
    @Param('proposal_id') proposal_id: number,
  ): Promise<Proposal> {
    const userId = req.user.id;
    try {
      const proposal = await this.proposalRepository.findOne({
        where: {
          id: proposal_id,
          userCreator: { id: userId },
          status: ProposalStatus.PENDING,
        },
        relations: ['user'],
      });

      if (!proposal)
        throw new NotFoundException(
          `Proposta com ID ${proposal_id} não encontrada para o usuário id ${userId} ou não está pendente.`,
        );

      proposal.status = ProposalStatus.SUCCESSFUL;
      proposal.userCreator.balance += proposal.profit;
      await this.userRepository.save(proposal.userCreator);
      return this.proposalRepository.save(proposal);
    } catch (error: any) {
      console.error(error);

      if (error.status === 404)
        throw new NotFoundException(error.message, error);
      else
        throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Get('profit-by-status')
  @ApiOperation({
    summary:
      'Retorna a soma do profit de todas as propostas por usuario agrupada por status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna todas proposas por status agrupado.',
  })
  async getProfitByStatus() {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder('proposal')
        .select('proposal.status', 'status')
        .addSelect('SUM(proposal.profit)', 'totalProfit')
        .groupBy('proposal.status')
        .getRawMany();

      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Get('best-users')
  @ApiOperation({
    summary:
      'Retorna os users que possuem o maior profit de propostas em sucesso vinculado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna todos os usuarios que possuem mais profit de sucesso',
  })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  async getBestUsers(@Query('start') start: string, @Query('end') end: string) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder('proposal')
        .select('user.id', 'id')
        .addSelect('user.name', 'fullName')
        .addSelect('SUM(proposal.profit)', 'totalProposal')
        .innerJoin('proposal.userCreator', 'user')
        .where('proposal.status = :status', { status: 'SUCCESSFUL' })
        .andWhere('proposal.createdAt BETWEEN :start AND :end', { start, end })
        .groupBy('user.id')
        .orderBy('totalProposal', 'DESC')
        .getRawMany();

      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erro ao obter os dados', error);
    }
  }

  @Get('/api/proposals/:id')
  async getProposalById(
    @Param('id') proposalId: number,
    @Req() req: { user: User },
  ): Promise<Proposal> {
    console.log(req);
    return await this.proposalRepository.findOne({ where: { id: proposalId } });
  }
}

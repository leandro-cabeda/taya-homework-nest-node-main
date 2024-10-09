import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import { User } from './entities/entities.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['user_id'];

    if (!userId)
      return res.status(401).json({ message: 'Usuario ID é obrigatório!' });

    try {
      const user = await this.userRepository.findOneBy({ id: Number(userId) });

      if (!user) 
        return res.status(404).json({ message: 'Usuario não encontrado' });
      
        (req as any).user = user;
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

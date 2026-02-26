import { BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole as UserRoleEntity } from '../database/entities/user-role.entity';
import { Role } from '../database/entities/role.entity';
import { BcryptService } from '../services/bcrypt.service';

@Command({
  name: 'create-admin-user',
  description: 'Create admin user',
})
export class CreateAdminUserCommand extends CommandRunner {
  private readonly logger = new Logger(CreateAdminUserCommand.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {
    super();
  }

  async run(inputs: string[], payload: Record<string, string>): Promise<void> {
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email: payload.email });

    if (user) throw new BadRequestException('Already signed up.');

    const u = userRepo.create({
      ...payload,
      password: this.bcryptService.hashSync(payload.password),
    });

    const savedUser = await userRepo.save(u);

    const role = await this.dataSource.getRepository(Role).findOneBy({ slug: 'admin' });
    if (role) {
      const userRole = this.dataSource.getRepository(UserRoleEntity).create({
        userId: savedUser.id,
        roleId: role.id,
        addedById: null,
        organizationId: null,
      });
      await this.dataSource.getRepository(UserRoleEntity).save(userRole);
    }

    this.logger.warn(await userRepo.findOneBy({ id: savedUser.id }));
  }

  @Option({
    flags: '-fn, --firstName <firstName>',
    description: 'A first name',
    required: true,
  })
  parsefirstName(val: string) {
    return val;
  }

  @Option({
    flags: '-ln, --lastName <lastName>',
    description: 'A last name',
    required: true,
  })
  parselastName(val: string) {
    return val;
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'A email',
    required: true,
  })
  parseEmail(val: string) {
    return val;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'A password',
    required: true,
  })
  parsePassword(val: string) {
    return val;
  }

  // @Option({
  //   flags: '-u, --userName <userName>',
  //   description: 'A username',
  //   required: true,
  // })
  // parseUsername(val: string) {
  //   return val;
  // }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    example: 'Spoke with Rajesh regarding festive season stock order. Follow-up next Monday.',
    description: 'Content of the customer follow-up note',
  })
  @IsString()
  @IsNotEmpty({ message: 'Note text cannot be empty' })
  note: string;
}

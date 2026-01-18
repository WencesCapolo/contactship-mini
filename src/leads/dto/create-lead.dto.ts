import {
    IsString,
    IsEmail,
    IsOptional,
    IsDateString,
    IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
    @ApiProperty({ example: 'John', description: 'Lead first name' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Lead last name' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Lead email address' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: '123 Main St', description: 'Street address' })
    @IsOptional()
    @IsString()
    street?: string;

    @ApiPropertyOptional({ example: 'New York', description: 'City' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: 'NY', description: 'State or province' })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ example: 'United States', description: 'Country' })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({ example: '10001', description: 'Postal code' })
    @IsOptional()
    @IsString()
    postcode?: string;

    @ApiPropertyOptional({ example: 'male', description: 'Gender' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({ example: '1990-05-15', description: 'Date of birth (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'Profile picture URL' })
    @IsOptional()
    @IsUrl()
    picture?: string;
}

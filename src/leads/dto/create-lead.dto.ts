import {
    IsString,
    IsEmail,
    IsOptional,
    IsDateString,
    IsUrl,
} from 'class-validator';

export class CreateLeadDto {
    // Required fields
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    // Optional contact info
    @IsOptional()
    @IsString()
    phone?: string;

    // Optional address fields
    @IsOptional()
    @IsString()
    street?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    postcode?: string;

    // Optional additional info
    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsUrl()
    picture?: string;
}

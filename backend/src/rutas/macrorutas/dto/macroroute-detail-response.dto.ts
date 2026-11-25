import { ApiMultiLineString } from '../../decorators/api-multilinestring.decorator';
import { MacrorouteResponseDto } from './macroroute-response.dto';

export class MacrorouteDetailResponseDto extends MacrorouteResponseDto {
  @ApiMultiLineString()
  geom: unknown;
}

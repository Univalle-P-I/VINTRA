import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
} from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  message: string | string[];

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;
}

type DocumentedErrorStatus = 400 | 404 | 409 | 500;

interface ApiEndpointOptions {
  summary: string;
  status?: number;
  responseDescription: string;
  responseShape?: 'object' | 'array' | 'page' | 'sizedPage' | 'none';
  responseSchema?: SchemaObject;
  roles?: readonly string[];
  errors?: readonly DocumentedErrorStatus[];
}

const errorDescriptions: Record<DocumentedErrorStatus, string> = {
  400: 'La solicitud contiene parámetros o datos no válidos.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado o una restricción del recurso.',
  500: 'Error inesperado del servidor; no incluye detalles internos.',
};

export function ApiEndpoint(options: ApiEndpointOptions): MethodDecorator {
  const status = options.status ?? 200;
  const responseShape = options.responseShape ?? 'object';
  const schema =
    options.responseSchema ??
    (responseShape === 'none'
      ? undefined
      : responseShape === 'array'
        ? {
            type: 'array' as const,
            items: { type: 'object' as const, additionalProperties: true },
          }
        : responseShape === 'page' || responseShape === 'sizedPage'
          ? {
              type: 'object' as const,
              properties: {
                items: {
                  type: 'array' as const,
                  items: {
                    type: 'object' as const,
                    additionalProperties: true,
                  },
                },
                total: { type: 'integer' as const },
                page: { type: 'integer' as const },
                [responseShape === 'page' ? 'limit' : 'size']: {
                  type: 'integer' as const,
                },
              },
            }
          : { type: 'object' as const, additionalProperties: true });

  const decorators: MethodDecorator[] = [
    ApiOperation({
      summary: options.summary,
      description: options.roles?.length
        ? `Requiere JWT Bearer. Roles permitidos: ${options.roles
            .map((role) => role.toUpperCase())
            .join(', ')}.`
        : undefined,
    }),
    ApiResponse({
      status,
      description: options.responseDescription,
      ...(schema ? { schema } : {}),
    }),
  ];

  const errorStatuses: DocumentedErrorStatus[] = [
    500,
    ...(options.errors ?? []),
  ];
  for (const errorStatus of errorStatuses) {
    decorators.push(
      ApiResponse({
        status: errorStatus,
        description: errorDescriptions[errorStatus],
        type: ApiErrorResponseDto,
      }),
    );
  }

  return applyDecorators(...decorators);
}

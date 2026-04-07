import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const exporterEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const exporter = new OTLPTraceExporter({
  url: `${exporterEndpoint}/v1/traces`,
});

// Using a simpler SDK config to avoid version mismatches in Resource
const sdk = new NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter),
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

export default sdk;

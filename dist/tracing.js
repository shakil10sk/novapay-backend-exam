"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_node_1 = require("@opentelemetry/sdk-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
    url: `${exporterEndpoint}/v1/traces`,
});
const sdk = new sdk_node_1.NodeSDK({
    spanProcessor: new sdk_trace_base_1.SimpleSpanProcessor(exporter),
    instrumentations: [new instrumentation_http_1.HttpInstrumentation(), new instrumentation_express_1.ExpressInstrumentation()],
});
sdk.start();
process.on('SIGTERM', () => {
    sdk.shutdown().finally(() => process.exit(0));
});
exports.default = sdk;
//# sourceMappingURL=tracing.js.map
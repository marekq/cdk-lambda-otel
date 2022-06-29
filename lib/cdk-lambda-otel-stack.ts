import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture, Code, Function, LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkLambdaOtelStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new NodejsFunction(this, 'LambdaFunction', 
      {
        entry: './src/lambda/index.ts',
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(15),
        memorySize: 512,
        tracing: Tracing.ACTIVE,
        architecture: Architecture.ARM_64,
        layers: [
          LayerVersion.fromLayerVersionArn(
            this,
            'otelLayer',
            'arn:aws:lambda:' + this.region + ':901920570463:layer:aws-otel-nodejs-arm64-ver-1-2-0:1'
          ),
          new LayerVersion(this, 'otelConfig', {
            code: Code.fromAsset('./src/config/'),
            compatibleRuntimes: [ Runtime.NODEJS_16_X ],
            description: 'otel-config',
            removalPolicy: RemovalPolicy.DESTROY
          }),
        ],
        environment: {
          AWS_LAMBDA_EXEC_WRAPPER: "/opt/otel-handler",
          OPENTELEMETRY_COLLECTOR_CONFIG_FILE: "/opt/config.yaml"
        }
      });
  }
}

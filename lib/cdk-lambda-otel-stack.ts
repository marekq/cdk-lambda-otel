import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { LayerVersion, Tracing } from 'aws-cdk-lib/aws-lambda';

export class CdkLambdaOtelStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new NodejsFunction(this, "function", {
      memorySize: 256,
      timeout: Duration.minutes(1),
      tracing: Tracing.ACTIVE,
      entry: "src/lambda/index.ts",
      handler: "handler",
      layers: [
        LayerVersion.fromLayerVersionArn(
          this,
          'otelLayer',
          'arn:aws:lambda:' + this.region + ':901920570463:layer:aws-otel-nodejs-ver-1-0-0:1'
        )
      ]   
    });
  }
}

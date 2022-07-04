import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture, Code, Function, LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class CdkLambdaOtelStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamoDBTable = new Table(this, 'DynamoDBTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    const lambdaFunction = new NodejsFunction(this, 'LambdaFunction', 
      {
        entry: './src/lambda/index.ts',
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(5),
        memorySize: 512,
        reservedConcurrentExecutions: 1,
        tracing: Tracing.ACTIVE,
        architecture: Architecture.ARM_64,
        bundling: {
          minify: true,
          forceDockerBundling: true
        },
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
      }
    );

    lambdaFunction.addEnvironment('DYNAMODB_TABLE_NAME', dynamoDBTable.tableName);
    dynamoDBTable.grantReadWriteData(lambdaFunction);
  }
}

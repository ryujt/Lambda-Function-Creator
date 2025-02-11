import { Lambda } from '@aws-sdk/client-lambda';
import { mkdir, writeFile, unlink, rmdir } from 'fs/promises';
import AdmZip from 'adm-zip';

// Default Lambda function code
const defaultCode = `export const handler = async (event) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
`;

export const handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event));
        const body = JSON.parse(event.body);
        const { functionName, runtime = 'nodejs22.x', region = 'ap-northeast-2' } = body;
        
        if (!functionName) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Function name is required',
                    error: 'MISSING_FUNCTION_NAME'
                })
            };
        }

        // Validate region
        if (!['ap-northeast-2', 'ap-northeast-1'].includes(region)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid region. Supported regions are: ap-northeast-2 (Seoul), ap-northeast-1 (Tokyo)',
                    error: 'INVALID_REGION'
                })
            };
        }

        // Create Lambda client with specified region
        const lambda = new Lambda({ region });

        // Create a temporary directory
        const tempDir = '/tmp/lambda-' + Date.now();
        await mkdir(tempDir);

        // Create index.mjs with default code
        await writeFile(tempDir + '/index.mjs', defaultCode);

        // Create zip file
        const zip = new AdmZip();
        zip.addLocalFile(tempDir + '/index.mjs');
        const zipBuffer = zip.toBuffer();

        // Create Lambda function
        const roleArn = '[your-role-arn]';
        const createParams = {
            Code: {
                ZipFile: zipBuffer
            },
            FunctionName: functionName,
            Handler: 'index.handler',
            Role: roleArn,
            Runtime: runtime,
            Architecture: 'arm64',
            Description: 'Auto-generated Lambda function',
            Timeout: 30,
            MemorySize: 128
        };

        console.log('Creating Lambda function with params:', JSON.stringify(createParams));
        await lambda.createFunction(createParams);

        // Create function URL config
        const urlParams = {
            AuthType: 'NONE',
            FunctionName: functionName,
            Cors: {
                AllowCredentials: false,
                AllowHeaders: ['*'],
                AllowMethods: ['*'],
                AllowOrigins: ['*'],
                ExposeHeaders: [],
                MaxAge: 3600
            }
        };

        console.log('Creating function URL with params:', JSON.stringify(urlParams));
        const functionUrl = await lambda.createFunctionUrlConfig(urlParams);

        // Add public access permission
        const permissionParams = {
            Action: 'lambda:InvokeFunctionUrl',
            FunctionName: functionName,
            Principal: '*',
            StatementId: 'FunctionURLAllowPublicAccess',
            FunctionUrlAuthType: 'NONE'
        };

        console.log('Adding permission with params:', JSON.stringify(permissionParams));
        await lambda.addPermission(permissionParams);

        // Clean up
        await unlink(tempDir + '/index.mjs');
        await rmdir(tempDir);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Lambda function created successfully',
                functionName: functionName,
                runtime: runtime,
                region: region,
                functionUrl: functionUrl.FunctionUrl
            })
        };

    } catch (error) {
        console.error('Error:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error creating Lambda function',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
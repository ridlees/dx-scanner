import { JavaLog4JConfiguredPractice } from './JavaLog4JConfiguredPractice';
import { PracticeEvaluationResult, ProgrammingLanguage } from '../../model';
import { TestContainerContext, createTestContainer } from '../../inversify.config';
import { pomXMLContents } from '../../detectors/__MOCKS__/Java/pomXMLContents.mock';
import { log4jXMLContents } from '../../detectors/__MOCKS__/Java/log4jXMLContents.mock';
import { codeStyleXML } from '../../detectors/__MOCKS__/Java/styleXMLContents.mock';

describe('JavaLog4JConfiguredPractice', () => {
  let practice: JavaLog4JConfiguredPractice;
  let containerCtx: TestContainerContext;

  beforeAll(() => {
    containerCtx = createTestContainer();
    containerCtx.container.bind('JavaLog4JConfiguredPractice').to(JavaLog4JConfiguredPractice);
    practice = containerCtx.container.get('JavaLog4JConfiguredPractice');
  });

  afterEach(async () => {
    containerCtx.virtualFileSystemService.clearFileSystem();
    containerCtx.practiceContext.fileInspector!.purgeCache();
  });

  it('Returns practicing if there is a correct configuration log4j.xml file', async () => {
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.xml': log4jXMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration in version 1.x of log4j.xml file', async () => {
    const oldLog4jXMLContents = `
    <!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">
    <log4j:configuration debug="true" xmlns:log4j='http://jakarta.apache.org/log4j/'>
    
      <appender name="console" class="org.apache.log4j.ConsoleAppender">
        <param name="Target" value="System.out"/>
        <layout class="org.apache.log4j.PatternLayout">
        <param name="ConversionPattern" value="%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n" />
        </layout>
      </appender>
    
      <root>
        <priority value ="debug"></priority>
        <appender-ref ref="console"></appender-ref>
      </root>
    
    </log4j:configuration>
    `;
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.xml': oldLog4jXMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration log4j.json file', async () => {
    const log4jJSONContents = `
    {
      "configuration": {
        "status": "error",
        "name": "RoutingTest",
        "packages": "org.apache.logging.log4j.test"
      }
    }`;
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.json': log4jJSONContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration log4j.yaml file', async () => {
    const log4jYAMLContents = `
    Configuration:
      status: warn
      name: YAMLConfigTest
      properties:
        property:
          name: filename
          value: target/test-yaml.log
      thresholdFilter:
        level: debug
      appenders:
        Console:
          name: STDOUT
          PatternLayout:
            Pattern: "%m%n"
    `;
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.yaml': log4jYAMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration log4j.yml file', async () => {
    const log4jYAMLContents = `
    Configuration:
      status: warn
      name: YAMLConfigTest
      properties:
        property:
          name: filename
          value: target/test-yaml.log
      thresholdFilter:
        level: debug
      appenders:
        Console:
          name: STDOUT
          PatternLayout:
            Pattern: "%m%n"
    `;
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.yml': log4jYAMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration log4j.properties file', async () => {
    const log4jPropertiesContents = `
    status = error
    dest = err
    name = PropertiesConfig
    property.filename = target/rolling/rollingtest.log
    filter.threshold.type = ThresholdFilter
    filter.threshold.level = debug
    appender.console.type = Console
    appender.console.name = STDOUT
    appender.rolling.type = RollingFile
    appender.rolling.name = RollingFile
    logger.rolling.additivity = false
    logger.rolling.appenderRef.rolling.ref = RollingFile
    rootLogger.level = info
    rootLogger.appenderRef.stdout.ref = STDOUT
    `;
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.properties': log4jPropertiesContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns practicing if there is a correct configuration for log4j2 base name', async () => {
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j2.xml': log4jXMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.practicing);
  });

  it('Returns notPracticing if there is no configuration file for log4j', async () => {
    containerCtx.virtualFileSystemService.setFileSystem({
      'code-styles.xml': codeStyleXML,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.notPracticing);
  });

  it('Returns notPracticing if the configuration file base name is not named correctly', async () => {
    containerCtx.virtualFileSystemService.setFileSystem({
      'terrible-naming-convention.xml': log4jXMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.notPracticing);
  });

  it('Returns notPracticing if the configuration file is using an unsupported extension', async () => {
    containerCtx.virtualFileSystemService.setFileSystem({
      'log4j.raml': log4jXMLContents,
      'pom.xml': pomXMLContents,
    });
    const evaluated = await practice.evaluate(containerCtx.practiceContext);
    expect(evaluated).toEqual(PracticeEvaluationResult.notPracticing);
  });

  it('Returns unknown if there is no fileInspector', async () => {
    const evaluated = await practice.evaluate({ ...containerCtx.practiceContext, fileInspector: undefined });
    expect(evaluated).toEqual(PracticeEvaluationResult.unknown);
  });

  it('Is applicable to Java', async () => {
    containerCtx.practiceContext.projectComponent.language = ProgrammingLanguage.Java;
    const result = await practice.isApplicable(containerCtx.practiceContext);
    expect(result).toEqual(true);
  });

  it('Is applicable to Kotlin', async () => {
    containerCtx.practiceContext.projectComponent.language = ProgrammingLanguage.Kotlin;
    const result = await practice.isApplicable(containerCtx.practiceContext);
    expect(result).toEqual(true);
  });

  it('Is not applicable to other languages', async () => {
    containerCtx.practiceContext.projectComponent.language = ProgrammingLanguage.Swift;
    const result = await practice.isApplicable(containerCtx.practiceContext);
    expect(result).toEqual(false);
  });
});

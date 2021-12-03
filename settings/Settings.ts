import { ISettingRead } from '@rocket.chat/apps-engine/definition/accessors/ISettingRead';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { IConfigurationExtend } from '@rocket.chat/apps-engine/definition/accessors';
import yaml = require('js-yaml');

export interface IPattern {
    name: string;
    searchPattern: RegExp;
    issuePattern: RegExp;
    link: string;
}

export class Settings {

    public static readonly EXCLUDE_PATTERNS: string = '\\`\\`\\`[^\\`]+\\`\\`\\`' +
        '|\\~\\~\\~[^\\~]+\\~\\~\\~' +
        '|\\`[^\\`]+\\`' +
        '|[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_\\+.~#?&//=]*' +
        '|\\[[^\\[\\]]+\\]\\([^\\(\\)]+\\)';
    public static readonly POSITIVE_LOOKBEHIND: string = '(?<=^|[^a-zA-Z0-9])';
    public static readonly POSITIVE_LOOKAHEAD: string = '(?=[^a-zA-Z0-9]|$)';

    public static readonly DEFAULT_PATTERN_YAML: string = `# turns "I:issue-1234" to a link to https://example.com/issues/issue-1234
example: 
    link: "https://example.com/issues/%ISSUE%"
    searchPattern: "I:[a-zA-Z]+-[0-9]+"
    issuePattern: "[a-zA-Z]+-[0-9]+"
# turns "GH:20" to a link to https://github.com/ceriath/regx2link/issues/20
github:
    link: "https://github.com/ceriath/regx2link/issues/%ISSUE%"
    searchPattern: "GH:[0-9]+"
    issuePattern: "[0-9]+"
`;
    public static readonly DEFAULT_MAX_SEARCH_ATTEMPTS: number = 25;


    public static readonly MAX_SEARCH_ATTEMPTS_ID: string = 'max-search-attempts';
    public static readonly PATTERN_YAML_ID: string = 'pattern-yaml';

    private _patterns: IPattern[];

    get patterns(): IPattern[] {
        return this._patterns;
    }

    private _maxSearchAttempts: number;

    get maxSearchAttempts(): number {
        return this._maxSearchAttempts;
    }

    public async init(configuration: IConfigurationExtend) {
        await configuration.settings.provideSetting({
            id: Settings.PATTERN_YAML_ID,
            type: SettingType.CODE,
            packageValue: Settings.DEFAULT_PATTERN_YAML,
            required: true,
            public: true,
            i18nLabel: 'Config_YAML',
            i18nDescription: 'Config_YAML_Descriptor',
        });
        await configuration.settings.provideSetting({
            id: Settings.MAX_SEARCH_ATTEMPTS_ID,
            type: SettingType.NUMBER,
            packageValue: Settings.DEFAULT_MAX_SEARCH_ATTEMPTS,
            required: true,
            public: true,
            i18nLabel: 'Max_Search_Attempts',
            i18nDescription: 'Max_Search_Attempts_Description',
        });
    }
    public onUpdate(setting: ISetting) {
        switch (setting.id) {
            case Settings.PATTERN_YAML_ID:
                this.updatePatterns(setting.value);
                break;
            case Settings.MAX_SEARCH_ATTEMPTS_ID:
                this._maxSearchAttempts = setting.value;
                break;
        }
    }

    public async setFrom(settings: ISettingRead) {
        this.updatePatterns(await settings.getValueById(Settings.MAX_SEARCH_ATTEMPTS_ID));
        this.updatePatterns(await settings.getValueById(Settings.PATTERN_YAML_ID));
    }

    private updatePatterns(value: string) {
        const loadedPatterns = yaml.load(value);
        const tmpPatterns: IPattern[] = []
        for (const patternName in loadedPatterns){
            tmpPatterns.push({
                name: patternName, 
                link: loadedPatterns[patternName]['link'], 
                searchPattern: new RegExp(
                    Settings.EXCLUDE_PATTERNS +
                    "|(" +
                    Settings.POSITIVE_LOOKBEHIND + 
                    loadedPatterns[patternName]['searchPattern'] + 
                    Settings.POSITIVE_LOOKAHEAD +
                    ")"
                    , 'g'), 
                issuePattern: new RegExp(
                    Settings.EXCLUDE_PATTERNS +
                    "|(" +
                    Settings.POSITIVE_LOOKBEHIND + 
                    loadedPatterns[patternName]['issuePattern'] + 
                    Settings.POSITIVE_LOOKAHEAD +
                    ")"
                    , 'g')
            });
        }
        this._patterns = tmpPatterns;
    }
}

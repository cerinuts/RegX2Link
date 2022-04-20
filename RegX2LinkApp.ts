import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
import { IMessage, IPreMessageSentModify, IPreMessageUpdatedModify } from '@rocket.chat/apps-engine/definition/messages';
import { Settings } from './settings/Settings';
import { MessageHandler } from './handler/MessageHandler';

export class RegX2LinkApp extends App implements IPreMessageSentModify, IPreMessageUpdatedModify {

    private _settings : Settings;
    private messageHandler: MessageHandler;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(configurationExtend: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> { 
        this.extendConfiguration(configurationExtend, environmentRead);        
        this.messageHandler = new MessageHandler(this._settings);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend, _environmentRead: IEnvironmentRead): Promise<void> {
        this._settings = new Settings();
        await this._settings.init(configuration);       
    }

    public async onEnable(environmentRead: IEnvironmentRead): Promise<boolean> {
        await this._settings.setFrom(environmentRead.getSettings());
        return true;
    }

    // tslint:disable-next-line:max-line-length
    public async onSettingUpdated(setting: ISetting): Promise<void> {
        this._settings.onUpdate(setting);
    }

    public async checkPreMessageSentModify(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return this.messageHandler.checkPreMessageModify(message, read, http);
    }

    public async checkPreMessageUpdatedModify(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return this.messageHandler.checkPreMessageModify(message, read, http);
    }

    // tslint:disable-next-line:max-line-length
    public async executePreMessageSentModify(message: IMessage, builder: IMessageBuilder, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
        return this.messageHandler.executePreMessageModify(message, builder, read, http, persistence);
    }

    // tslint:disable-next-line:max-line-length
    public async executePreMessageUpdatedModify(message: IMessage, builder: IMessageBuilder, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
        return this.messageHandler.executePreMessageModify(message, builder, read, http, persistence);
    }
}

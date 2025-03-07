
import {DeviceExecutor} from '../fs';
import {System, Process, UserSession} from '../index';
import {BashUserSession} from './bash';


export type RequiredArgument<Name extends string = string> = `${Name}`;
export type OptionalArgument<Name extends string = string> = `[${Name}]`;
export type VariadicArgument<Name extends string = string> = `${Name}...`;
export type Argument<Name extends string = string> = RequiredArgument<Name> | OptionalArgument<Name> | VariadicArgument<Name>;

export type BooleanOption<Name extends string = string> = `-${Name}`;
export type OptionWithRequiredArgument<Name extends string = string, Arg extends string = string> = `${BooleanOption<Name>}=${RequiredArgument<Arg>}`;
export type OptionWithOptionalArgument<Name extends string = string, Arg extends string = string> = `${BooleanOption<Name>}=${OptionalArgument<Arg>}`;
export type Option<Name extends string = string> = BooleanOption<Name> | OptionWithRequiredArgument<Name> | OptionWithOptionalArgument<Name>;

export type ChangeNameOfOption<Opt extends Option, Name extends string> = Opt extends `-${infer OldName}=[${infer Arg}]` ? OptionWithOptionalArgument<`-${Name}`, Arg> : (Opt extends `-${infer OldName}=${infer Arg}` ? OptionWithRequiredArgument<`-${Name}`, Arg> : (Opt extends `-${infer OldName}` ? BooleanOption<Name> : never));

export type ParsedRequiredArgument<Name extends string = string> = {name: Name, optional: false, variadic: false, synopsis: string};
export type ParsedOptionalArgument<Name extends string = string> = {name: Name, optional: true, variadic: false, synopsis: string};
export type ParsedVariadicArgument<Name extends string = string> = {name: Name, optional: false, variadic: true, synopsis: string};
export type ParsedArgument<Name extends string = string> = ParsedRequiredArgument<Name> | ParsedOptionalArgument<Name> | ParsedVariadicArgument<Name>;

export type ParsedBooleanOption<Name extends string = string, LongName extends string | undefined = undefined> = {name: Name, longName?: LongName, arg: null, argIsOptional: null, description?: string};
export type ParsedOptionWithRequiredArgument<Name extends string = string, Arg extends string = string, LongName extends string | undefined = undefined> = {name: Name, longName?: LongName, arg: Arg, argIsOptional: false, description?: string};
export type ParsedOptionWithOptionalArgument<Name extends string = string, Arg extends string = string, LongName extends string | undefined = undefined> = {name: Name, longName?: LongName, arg: Arg, argIsOptional: true, description?: string};
export type ParsedOption<Name extends string = string, LongName extends string | undefined = string | undefined> = ParsedBooleanOption<Name, LongName> | ParsedOptionWithRequiredArgument<Name, string, LongName> | ParsedOptionWithOptionalArgument<Name, string, LongName>;

export type ArgumentToParsedArgument<Arg extends Argument> = Arg extends `[${infer Name}]` ? ParsedOptionalArgument<Name> : (Arg extends `${infer Name}...` ? ParsedVariadicArgument<Name> : ParsedRequiredArgument<Arg>);
export type OptionToParsedOption<Opt extends Option, LongName extends string | undefined = undefined> = Opt extends `-${infer Name}=[${infer Arg}]` ? ParsedOptionWithOptionalArgument<Name, Arg, LongName> : (Opt extends `-${infer Name}=${infer Arg}` ? ParsedOptionWithRequiredArgument<Name, Arg, LongName> : (Opt extends `-${infer Name}` ? ParsedBooleanOption<Name, LongName> : never));

export type ParsedArguments<Args extends ParsedArgument[], Opts extends ParsedOption[]> = {[Arg in Args[number] as Arg['name']]: Arg extends ParsedRequiredArgument ? string : (Arg extends ParsedOptionalArgument ? string | undefined : (Arg extends ParsedVariadicArgument ? string[] : never))} & {[Opt in Opts[number] as Opt['name']]: Opt extends ParsedBooleanOption ? boolean : (Opt extends ParsedOptionWithOptionalArgument ? string | true | undefined : (Opt extends ParsedOptionWithRequiredArgument ? string | undefined : never))};

export type CommandFunction<Args extends ParsedArgument[], Opts extends ParsedOption[]> = (options: {args: ParsedArguments<Args, Opts>, process: Process, session: BashUserSession, system: System}) => void;


export class ArgumentParsingError<Args extends ParsedArgument[], Opts extends ParsedOption[]> extends Error {

    [Symbol.toStringTag] = 'ArgumentParsingError';
    cmd: Command<Args, Opts>;

    constructor(cmd: Command<Args, Opts>, msg: string) {
        super(msg);
        this.cmd = cmd;
    }

    toString() {
        return this.cmd.name + ': ' + this.message;
    }

}


function flagToCamelCase(flag: string): string {
    let out = '';
    for (let i = 0; i < flag.length; i++) {
        let char = flag[i];
        if (out === '' && char === '-') {
            continue;
        }
        if (char === '-') {
            i++;
            out += flag[i].toUpperCase();
        } else {
            out += char;
        }
    }
    return out;
}

export class Command<Args extends ParsedArgument[] = [], Opts extends ParsedOption[] = []> {

    name: string;
    description: string;
    args: Args = [] as unknown as Args;
    options: Opts = [] as unknown as Opts;
    optionsForParsing: Map<string, {key: string, hasArg: boolean, argIsOptional: boolean}> = new Map();

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    func(func: CommandFunction<Args, Opts>): DeviceExecutor {
        return (process: Process, session: UserSession) =>  {
            let parsed = this.parse(process.argv);
            if (typeof parsed === 'string') {
                process.stdout += parsed + '\n';
            } else {
                func({args: parsed, process, session: session as BashUserSession, system: session.system});
            }
        };
    }

    argument<T extends Argument>(arg: T, synopsis?: string): Command<[...Args, ArgumentToParsedArgument<T>], Opts> {
        if (arg.startsWith('[') && arg.endsWith(']')) {
            let name = arg.slice(1, -1);
            synopsis ??= `[${name.toUpperCase()}]`;
            this.args.push({name, optional: true, variadic: false, synopsis});
        } else if (arg.endsWith('...')) {
            let name = arg.slice(0, -3);
            synopsis ??= `${arg.toUpperCase()}...`;
            this.args.push({name, optional: false, variadic: true, synopsis});
        } else {
            synopsis ??= arg.toUpperCase();
            this.args.push({name: arg, optional: false, variadic: false, synopsis});
        }
        return this as unknown as Command<[...Args, ArgumentToParsedArgument<T>], Opts>;
    }

    option<T extends Option, LongName extends string>(name: T, longName: ChangeNameOfOption<T, LongName>, description?: string): Command<Args, [...Opts, OptionToParsedOption<T, LongName>]>;
    option<T extends Option>(name: T, description?: string): Command<Args, [...Opts, OptionToParsedOption<T>]>;
    option<T extends Option, LongName extends string | undefined = undefined>(name: T, descriptionOrLongName: LongName extends `${infer Name}` ? ChangeNameOfOption<T, Name> : string, description?: string): Command<Args, [...Opts, OptionToParsedOption<T, LongName>]> {
        let longName: string | undefined;
        if (description === undefined) {
            if (descriptionOrLongName.startsWith('--')) {
                description = '';
                longName = descriptionOrLongName;
            } else {
                description = descriptionOrLongName;
            }
        } else {
            longName = descriptionOrLongName;
        }
        let arg = null;
        let argIsOptional = false;
        if (name.includes('=')) {
            let parts = name.split('=');
            // @ts-ignore
            name = parts[0];
            let arg: string;
            let argIsOptional: boolean;
            if (parts[1].startsWith('[') && parts[1].endsWith(']')) {
                arg = parts[1].slice(1, -1);
                argIsOptional = true;
            } else {
                arg = parts[1];
                argIsOptional = false;
            }
            this.options.push({name, longName, arg, argIsOptional, description});
        } else {
            this.options.push({name, longName, arg: null, argIsOptional: null, description});
        }
        let key = flagToCamelCase(name);
        this.optionsForParsing.set(name, {key, hasArg: arg !== null, argIsOptional});
        if (longName !== undefined) {
            this.optionsForParsing.set(longName, {key, hasArg: arg !== null, argIsOptional});
        }
        return this as unknown as Command<Args, [...Opts, OptionToParsedOption<T, LongName>]>;
    }

    parse(argv: string[]): ParsedArguments<Args, Opts> | string {
        let out: {[key: string]: unknown} = {};
        let posArgs = [];
        for (let i = 0; i < argv.length; i++) {
            let arg = argv[i];
            if (arg.startsWith('-')) {
                let [_flags, flagArg] = arg.split('=');
                let flags = _flags.startsWith('--') ? [_flags.slice(2)] : _flags.slice(1);
                for (let flag of flags) {
                    let option = this.optionsForParsing.get(flag);
                    if (option === undefined) {
                        if (flag === '-h' || flag === '--help') {
                            if (flagArg === undefined) {
                                throw new ArgumentParsingError(this, `flag ${arg} does not take an argument`);
                            } else {
                                return this.getHelpMessage() + '\n';
                            }
                        } else {
                            throw new ArgumentParsingError(this, `unrecognized flag ${flag}`);
                        }
                    } else {
                        let {key, hasArg, argIsOptional} = option;
                        if (hasArg) {
                            if (flagArg.startsWith('-')) {
                                if (argIsOptional) {
                                    out[key] = '';
                                } else {
                                    throw new ArgumentParsingError(this, `flag ${arg} requires an argument`);
                                }
                            } else {
                                out[key] = flagArg;
                            }
                        } else if (flagArg !== undefined) {
                            throw new ArgumentParsingError(this, `flag ${arg} does not take an argument`);
                        } else {
                            out[key] = '';
                        }
                    }
                }
            } else {
                posArgs.push(arg);
            }
        }
        for (let i = 0; i < posArgs.length; i++) {
            // todo: write positional args parser
        }
        return out as ParsedArguments<Args, Opts>;
    }

    getHelpMessage(): string {
        let argUsage = this.args.map(arg => arg.synopsis).join(' ').toUpperCase();
        let out = `Usage: ${this.name} ${this.options.length > 0 ? 'OPTION ' : ''}${argUsage}\n`;
        out += this.description + '\n';
        if (this.options.length > 0) {
            out += '\n';
            for (let option of this.options) {

            }
        }
        return out;
    }

}

export function command(name: string, description: string): Command {
    return new Command(name, description);
}

export default command;

CREATE TABLE public.pacientes (
	id integer NOT NULL,
	nm_paciente varchar NOT NULL,
	dt_nascimento date NOT NULL,
	rg_paciente varchar NULL,
	cpf_paciente varchar NULL,
	ds_observacao varchar NULL,
	CONSTRAINT pacientes_pk PRIMARY KEY (id)
);

CREATE TABLE public.avaliacao (
	id integer NOT NULL,
	id_usuario integer NOT NULL,
	id_paciente integer NOT NULL,
	tp_jogo varchar NOT NULL,
	nr_potuacao decimal NOT NULL,
	qt_tempo integer NULL,
	tp_status varchar NOT NULL,
	ds_observacao varchar NULL,
	CONSTRAINT avaliacao_pk PRIMARY KEY (id),
	CONSTRAINT avaliacao_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(codigo),
	CONSTRAINT avaliacao_pacientes_fk FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id)
);


ALTER TABLE public.usuario ADD tp_usuario varchar DEFAULT ADMIN NOT NULL;
ALTER TABLE public.usuario ADD id_paciente integer NULL;
ALTER TABLE public.usuario ADD CONSTRAINT usuario_pacientes_fk FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id);
ALTER TABLE public.avaliacao ADD nm_avaliacao varchar NOT NULL;
